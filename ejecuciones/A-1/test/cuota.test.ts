import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota, type ContextoDeCobro } from '../src/dominio/cuota.ts';
import { fechaDesdeIso } from '../src/dominio/fecha.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

function cobroEl(fechaIso: string, sociosDeSuFamilia = 1): ContextoDeCobro {
  return { fecha: fechaDesdeIso(fechaIso), sociosDeSuFamilia };
}

test('el plan básico cuesta 29,90 €', () => {
  assert.equal(calcularCuota(socioBase, cobroEl('2026-03-01')), 2990);
});

test('el plan premium cuesta 49,90 €', () => {
  assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, cobroEl('2026-03-01')), 4990);
});

test('sin 2 años cumplidos de antigüedad no hay descuento', () => {
  const socio = { ...socioBase, fechaAlta: '2024-03-01' };

  assert.equal(calcularCuota(socio, cobroEl('2026-02-28')), 2990);
});

test('con 2 años cumplidos de antigüedad se descuenta un 10 %', () => {
  const socio = { ...socioBase, fechaAlta: '2024-03-01' };

  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2691);
});

test('con casi 5 años de antigüedad se sigue descontando un 10 %', () => {
  const socio = { ...socioBase, fechaAlta: '2021-03-01' };

  assert.equal(calcularCuota(socio, cobroEl('2026-02-28')), 2691);
});

test('con 5 años cumplidos de antigüedad se descuenta un 15 % y el medio céntimo redondea hacia arriba', () => {
  const socio: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2021-03-01' };

  // 4990 × 0,85 = 4241,5
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 4242);
});

test('un estudiante que aún no ha cumplido 26 años tiene un 20 % de descuento', () => {
  const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-02' };

  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2392);
});

test('un estudiante que ya ha cumplido 26 años no tiene descuento de estudiante', () => {
  const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-01' };

  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2990);
});

test('un menor de 26 años que no es estudiante no tiene descuento de estudiante', () => {
  const socio = { ...socioBase, esEstudiante: false, fechaNacimiento: '2005-01-01' };

  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2990);
});

test('los descuentos de antigüedad y de estudiante no se acumulan: se aplica el mayor', () => {
  const socio: Socio = {
    ...socioBase,
    plan: 'premium',
    esEstudiante: true,
    fechaNacimiento: '2003-01-01',
    fechaAlta: '2020-01-01',
  };

  // Estudiante 20 % frente a antigüedad 15 %: 4990 × 0,80
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 3992);
});

test('en una familia de 3 socios se descuenta un 5 %', () => {
  // 2990 × 0,95 = 2840,5
  assert.equal(calcularCuota({ ...socioBase, familiaId: 'f1' }, cobroEl('2026-03-01', 3)), 2841);
});

test('en una familia de 2 socios no hay descuento familiar', () => {
  assert.equal(calcularCuota({ ...socioBase, familiaId: 'f1' }, cobroEl('2026-03-01', 2)), 2990);
});

test('el descuento familiar se suma al de antigüedad', () => {
  const socio: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2024-01-01', familiaId: 'f1' };

  // 10 % + 5 %: 4990 × 0,85 = 4241,5
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01', 4)), 4242);
});

test('en agosto el plan básico tiene un 25 % de descuento', () => {
  // 2990 × 0,75 = 2242,5
  assert.equal(calcularCuota(socioBase, cobroEl('2026-08-15')), 2243);
});

test('en agosto el plan premium no tiene descuento de verano', () => {
  assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, cobroEl('2026-08-15')), 4990);
});

test('el descuento de verano se suma al resto hasta un tope del 30 %', () => {
  const socio: Socio = { ...socioBase, fechaAlta: '2024-01-01' };

  // 10 % + 25 % = 35 %, limitado al 30 %: 2990 × 0,70
  assert.equal(calcularCuota(socio, cobroEl('2026-08-01')), 2093);
});

test('el descuento total nunca supera el 30 %', () => {
  const socio: Socio = {
    ...socioBase,
    esEstudiante: true,
    fechaNacimiento: '2004-05-05',
    familiaId: 'f1',
  };

  // 20 % + 5 % + 25 % = 50 %, limitado al 30 %
  assert.equal(calcularCuota(socio, cobroEl('2026-08-31', 3)), 2093);
});
