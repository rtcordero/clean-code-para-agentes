import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  descuentoDeVerano,
  descuentoNoAcumulable,
  descuentoPorAntiguedad,
  descuentoPorEstudiante,
  descuentoPorFamilia,
  descuentoTotal,
} from '../src/dominio/descuentos.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const estudiante: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-01' };

test('antigüedad: sin descuento el día antes de cumplir 2 años', () => {
  assert.equal(descuentoPorAntiguedad('2024-03-01', '2026-02-28'), 0);
});

test('antigüedad: 10 % el día que cumple 2 años', () => {
  assert.equal(descuentoPorAntiguedad('2024-03-01', '2026-03-01'), 10);
});

test('antigüedad: 10 % el día antes de cumplir 5 años', () => {
  assert.equal(descuentoPorAntiguedad('2021-03-01', '2026-02-28'), 10);
});

test('antigüedad: 15 % el día que cumple 5 años y después', () => {
  assert.equal(descuentoPorAntiguedad('2021-03-01', '2026-03-01'), 15);
  assert.equal(descuentoPorAntiguedad('2010-01-01', '2026-03-01'), 15);
});

test('estudiante: 20 % el día antes de cumplir 26 años', () => {
  assert.equal(descuentoPorEstudiante(estudiante, '2026-02-28'), 20);
});

test('estudiante: sin descuento el día que cumple 26 años', () => {
  assert.equal(descuentoPorEstudiante(estudiante, '2026-03-01'), 0);
});

test('estudiante: sin descuento si no es estudiante aunque sea joven', () => {
  assert.equal(descuentoPorEstudiante({ ...estudiante, esEstudiante: false }, '2026-02-28'), 0);
});

test('antigüedad y estudiante no se acumulan: se aplica el mayor', () => {
  const estudianteVeterano = { ...estudiante, fechaAlta: '2020-01-01' };
  assert.equal(descuentoNoAcumulable(estudianteVeterano, '2026-02-28'), 20);
  assert.equal(descuentoNoAcumulable(estudianteVeterano, '2026-03-01'), 15);
});

test('familia: sin descuento con 2 socios', () => {
  assert.equal(descuentoPorFamilia(2), 0);
});

test('familia: 5 % con 3 socios o más', () => {
  assert.equal(descuentoPorFamilia(3), 5);
  assert.equal(descuentoPorFamilia(4), 5);
});

test('verano: 25 % para el plan básico durante todo agosto', () => {
  assert.equal(descuentoDeVerano('basico', '2026-08-01'), 25);
  assert.equal(descuentoDeVerano('basico', '2026-08-31'), 25);
});

test('verano: sin descuento fuera de agosto', () => {
  assert.equal(descuentoDeVerano('basico', '2026-07-31'), 0);
  assert.equal(descuentoDeVerano('basico', '2026-09-01'), 0);
});

test('verano: sin descuento para el plan premium en agosto', () => {
  assert.equal(descuentoDeVerano('premium', '2026-08-15'), 0);
});

test('total: familia y antigüedad se suman', () => {
  const veterano = { ...socioBase, fechaAlta: '2020-01-01' };
  assert.equal(descuentoTotal(veterano, { fechaCobro: '2026-03-01', sociosEnFamilia: 3 }), 20);
});

test('total: exactamente el 30 % se respeta', () => {
  assert.equal(descuentoTotal(socioBase, { fechaCobro: '2026-08-10', sociosEnFamilia: 3 }), 30);
});

test('total: nunca supera el 30 %', () => {
  assert.equal(descuentoTotal(estudiante, { fechaCobro: '2025-08-10', sociosEnFamilia: 3 }), 30);
});

test('total: sin descuentos si no aplica ninguno', () => {
  assert.equal(descuentoTotal(socioBase, { fechaCobro: '2026-03-01', sociosEnFamilia: 1 }), 0);
});
