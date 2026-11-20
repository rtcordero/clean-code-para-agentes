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

test('sin descuento el importe es la tarifa', () => {
  assert.equal(aplicarDescuento(2990, 0), 2990);
});

test('el medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(2990, 15), 2542);
});

test('por debajo del medio céntimo se redondea hacia abajo', () => {
  assert.equal(aplicarDescuento(4990, 13), 4341);
});

test('por encima del medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(4990, 17), 4142);
});

test('un socio sin descuentos paga la tarifa de su plan', () => {
  const contexto = { fechaCobro: '2026-03-01', sociosEnFamilia: 1 };
  assert.equal(calcularCuotaConDescuentos(socioBase, contexto), 2990);
});

test('un socio premium con 5 años y familia numerosa paga con un 20 %', () => {
  const veterano: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2021-03-01' };
  const contexto = { fechaCobro: '2026-03-01', sociosEnFamilia: 3 };
  assert.equal(calcularCuotaConDescuentos(veterano, contexto), 3992);
});

test('un estudiante del plan básico en agosto paga con el tope del 30 %', () => {
  const estudiante: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  const contexto = { fechaCobro: '2026-08-10', sociosEnFamilia: 1 };
  assert.equal(calcularCuotaConDescuentos(estudiante, contexto), 2093);
});
