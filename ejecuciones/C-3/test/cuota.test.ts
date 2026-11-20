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

test('el medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(2990, 15), 2542);
});

test('por encima del medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(2990, 7), 2781);
});

test('por debajo del medio céntimo se redondea hacia abajo', () => {
  assert.equal(aplicarDescuento(2990, 3), 2900);
});

test('sin descuentos aplicables la cuota es la tarifa del plan', () => {
  const condiciones = { fechaCobro: new Date('2026-03-10T12:00:00Z'), sociosEnSuFamilia: 0 };
  assert.equal(calcularCuotaConDescuentos(socioBase, condiciones), 2990);
});

test('premium con 5 años de antigüedad paga 42,42 €', () => {
  const socio: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2021-03-10' };
  const condiciones = { fechaCobro: new Date('2026-03-10T12:00:00Z'), sociosEnSuFamilia: 0 };
  assert.equal(calcularCuotaConDescuentos(socio, condiciones), 4242);
});

test('básico de estudiante en familia y en agosto paga con el tope del 30 %', () => {
  const socio: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  const condiciones = { fechaCobro: new Date('2026-08-15T12:00:00Z'), sociosEnSuFamilia: 3 };
  assert.equal(calcularCuotaConDescuentos(socio, condiciones), 2093);
});
