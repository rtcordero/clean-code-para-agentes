import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota, type ContextoCobro } from '../src/dominio/cuota.ts';
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

function cobroEl(fecha: string, sociosEnSuFamilia = 1): ContextoCobro {
  return { fechaCobro: fechaDesdeIso(fecha), sociosEnSuFamilia };
}

const DIA_SIN_DESCUENTOS = cobroEl('2026-03-01');

test('el plan básico cuesta 29,90 € sin descuentos', () => {
  assert.equal(calcularCuota(socioBase, DIA_SIN_DESCUENTOS), 2990);
});

test('el plan premium cuesta 49,90 € sin descuentos', () => {
  assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, DIA_SIN_DESCUENTOS), 4990);
});

test('antigüedad: sin descuento la víspera de cumplir 2 años', () => {
  const socio = { ...socioBase, fechaAlta: '2024-03-01' };
  assert.equal(calcularCuota(socio, cobroEl('2026-02-28')), 2990);
});

test('antigüedad: 10 % el día que cumple 2 años', () => {
  const socio = { ...socioBase, fechaAlta: '2024-03-01' };
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2691);
});

test('antigüedad: sigue en 10 % la víspera de cumplir 5 años', () => {
  const socio = { ...socioBase, fechaAlta: '2021-03-01' };
  assert.equal(calcularCuota(socio, cobroEl('2026-02-28')), 2691);
});

test('antigüedad: 15 % el día que cumple 5 años, redondeando medio céntimo hacia arriba', () => {
  const socio = { ...socioBase, fechaAlta: '2021-03-01' };
  // 2990 × 0,85 = 2541,5
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2542);
});

test('estudiante: 20 % si aún no ha cumplido 26 años', () => {
  const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-02' };
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2392);
});

test('estudiante: sin descuento el día que cumple 26 años', () => {
  const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-01' };
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 2990);
});

test('menor de 26 que no es estudiante no tiene descuento de estudiante', () => {
  const socio = { ...socioBase, fechaNacimiento: '2005-01-01' };
  assert.equal(calcularCuota(socio, DIA_SIN_DESCUENTOS), 2990);
});

test('antigüedad y estudiante no se acumulan: se aplica el mayor', () => {
  const socio: Socio = {
    ...socioBase,
    plan: 'premium',
    esEstudiante: true,
    fechaNacimiento: '2002-01-01',
    fechaAlta: '2020-01-01',
  };
  // 15 % de antigüedad frente a 20 % de estudiante → 20 %
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 3992);
});

test('estudiante que ya cumplió 26 conserva su descuento de antigüedad', () => {
  const socio: Socio = {
    ...socioBase,
    plan: 'premium',
    esEstudiante: true,
    fechaNacimiento: '1995-01-01',
    fechaAlta: '2020-01-01',
  };
  // 4990 × 0,85 = 4241,5
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01')), 4242);
});

test('familia: sin descuento con 2 socios en la familia', () => {
  assert.equal(calcularCuota(socioBase, cobroEl('2026-03-01', 2)), 2990);
});

test('familia: 5 % con 3 socios en la familia', () => {
  // 2990 × 0,95 = 2840,5
  assert.equal(calcularCuota(socioBase, cobroEl('2026-03-01', 3)), 2841);
});

test('familia se acumula con antigüedad', () => {
  const socio = { ...socioBase, plan: 'premium' as const, fechaAlta: '2024-01-01' };
  // 10 % + 5 % = 15 % → 4990 × 0,85 = 4241,5
  assert.equal(calcularCuota(socio, cobroEl('2026-03-01', 4)), 4242);
});

test('verano: el plan básico tiene un 25 % en agosto', () => {
  // 2990 × 0,75 = 2242,5
  assert.equal(calcularCuota(socioBase, cobroEl('2026-08-01')), 2243);
  assert.equal(calcularCuota(socioBase, cobroEl('2026-08-31')), 2243);
});

test('verano: no aplica fuera de agosto', () => {
  assert.equal(calcularCuota(socioBase, cobroEl('2026-07-31')), 2990);
  assert.equal(calcularCuota(socioBase, cobroEl('2026-09-01')), 2990);
});

test('verano: no aplica al plan premium', () => {
  assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, cobroEl('2026-08-15')), 4990);
});

test('el descuento total llega como mucho al 30 %', () => {
  const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  // 20 % + 5 % + 25 % = 50 % → tope 30 % → 2990 × 0,70 = 2093
  assert.equal(calcularCuota(socio, cobroEl('2026-08-10', 3)), 2093);
});

test('un descuento total de exactamente el 30 % se aplica entero', () => {
  // 5 % familia + 25 % verano
  assert.equal(calcularCuota(socioBase, cobroEl('2026-08-10', 3)), 2093);
});
