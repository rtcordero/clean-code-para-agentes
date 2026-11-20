import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aplicarDescuento, calcularCuota, calcularCuotaConDescuentos } from '../src/dominio/cuota.ts';
import { fechaDesdeTexto } from '../src/dominio/fecha.ts';
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

test('aplicar un descuento del 0 % deja el importe igual', () => {
  assert.equal(aplicarDescuento(2990, 0), 2990);
});

test('el medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(4990, 15), 4242);
});

test('por debajo del medio céntimo se redondea hacia abajo', () => {
  assert.equal(aplicarDescuento(1004, 15), 853);
});

test('por encima del medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(1001, 15), 851);
});

test('sin descuentos se cobra la tarifa del plan', () => {
  const datos = { fechaCobro: fechaDesdeTexto('2026-03-01'), sociosEnFamilia: 1 };
  assert.equal(calcularCuotaConDescuentos(socioBase, datos), 2990);
});

test('el plan premium con 2 años de antigüedad paga 44,91 €', () => {
  const socio: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2024-03-01' };
  const datos = { fechaCobro: fechaDesdeTexto('2026-03-01'), sociosEnFamilia: 1 };
  assert.equal(calcularCuotaConDescuentos(socio, datos), 4491);
});

test('el plan básico en agosto con antigüedad y familia paga el tope del 30 %', () => {
  const socio: Socio = { ...socioBase, fechaAlta: '2020-01-01' };
  const datos = { fechaCobro: fechaDesdeTexto('2026-08-01'), sociosEnFamilia: 3 };
  assert.equal(calcularCuotaConDescuentos(socio, datos), 2093);
});
