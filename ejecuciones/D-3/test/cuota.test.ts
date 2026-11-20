import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aplicarDescuento, calcularCuota } from '../src/dominio/cuota.ts';
import type { CondicionesDelCobro } from '../src/dominio/descuentos.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const sinDescuentos: CondicionesDelCobro = { fechaCobro: '2026-03-01', sociosEnFamilia: 1 };

test('el plan básico cuesta 29,90 €', () => {
  assert.equal(calcularCuota(socioBase, sinDescuentos), 2990);
});

test('el plan premium cuesta 49,90 €', () => {
  assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, sinDescuentos), 4990);
});

test('el medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(2990, 15), 2542);
  assert.equal(aplicarDescuento(4990, 5), 4741);
});

test('un importe exacto no se redondea', () => {
  assert.equal(aplicarDescuento(2990, 10), 2691);
});

test('básico con 5 años de antigüedad paga 25,42 €', () => {
  const veterano = { ...socioBase, fechaAlta: '2021-03-01' };
  assert.equal(calcularCuota(veterano, sinDescuentos), 2542);
});

test('básico en agosto con el descuento máximo paga 20,93 €', () => {
  const estudiante = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  assert.equal(calcularCuota(estudiante, { fechaCobro: '2026-08-01', sociosEnFamilia: 3 }), 2093);
});

test('premium estudiante paga 39,92 €', () => {
  const estudiante: Socio = { ...socioBase, plan: 'premium', esEstudiante: true, fechaNacimiento: '2005-01-01' };
  assert.equal(calcularCuota(estudiante, sinDescuentos), 3992);
});
