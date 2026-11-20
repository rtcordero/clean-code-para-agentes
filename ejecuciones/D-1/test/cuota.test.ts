import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aplicarDescuento, calcularCuota, calcularCuotaConDescuentos } from '../src/dominio/cuota.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

test('el plan básico cuesta 29,90 €', () => {
  assert.equal(calcularCuota(socioBase), 2990);
});

test('el plan premium cuesta 49,90 €', () => {
  assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }), 4990);
});

test('sin descuento se cobra la tarifa entera', () => {
  assert.equal(aplicarDescuento(2990, 0), 2990);
});

test('un descuento exacto no necesita redondeo', () => {
  assert.equal(aplicarDescuento(2990, 30), 2093);
});

test('el medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(2990, 15), 2542);
  assert.equal(aplicarDescuento(4990, 5), 4741);
});

test('por debajo del medio céntimo se redondea hacia abajo', () => {
  assert.equal(aplicarDescuento(4990, 13), 4341);
});

test('la cuota con descuentos aplica el porcentaje total a la tarifa del plan', () => {
  const premiumVeterano: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2020-01-01' };
  const condiciones = { fechaCobro: '2026-03-01', sociosEnLaFamilia: 3 };
  assert.equal(calcularCuotaConDescuentos(premiumVeterano, condiciones), 3992);
});

test('la cuota con descuentos respeta el tope del 30 %', () => {
  const estudiante: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  const condiciones = { fechaCobro: '2026-08-03', sociosEnLaFamilia: 4 };
  assert.equal(calcularCuotaConDescuentos(estudiante, condiciones), 2093);
});
