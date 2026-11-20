import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  descuentoDeVerano,
  descuentoPersonal,
  descuentoPorAntiguedad,
  descuentoPorEstudiante,
  descuentoPorFamilia,
  descuentoTotal,
  limitarDescuentoTotal,
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

test('sin 2 años cumplidos de antigüedad no hay descuento', () => {
  assert.equal(descuentoPorAntiguedad('2024-06-10', '2026-06-09'), 0);
});

test('con 2 años cumplidos justos la antigüedad descuenta un 10 %', () => {
  assert.equal(descuentoPorAntiguedad('2024-06-10', '2026-06-10'), 10);
});

test('la víspera de los 5 años la antigüedad sigue en el 10 %', () => {
  assert.equal(descuentoPorAntiguedad('2021-06-10', '2026-06-09'), 10);
});

test('con 5 años cumplidos justos la antigüedad descuenta un 15 %', () => {
  assert.equal(descuentoPorAntiguedad('2021-06-10', '2026-06-10'), 15);
});

test('con más de 5 años la antigüedad sigue en el 15 %', () => {
  assert.equal(descuentoPorAntiguedad('2010-01-01', '2026-06-10'), 15);
});

const estudiante: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-09-15' };

test('un estudiante con 25 años, la víspera de cumplir 26, tiene un 20 %', () => {
  assert.equal(descuentoPorEstudiante(estudiante, '2026-09-14'), 20);
});

test('un estudiante el día que cumple 26 años ya no tiene descuento', () => {
  assert.equal(descuentoPorEstudiante(estudiante, '2026-09-15'), 0);
});

test('quien no es estudiante no tiene descuento de estudiante aunque sea joven', () => {
  assert.equal(descuentoPorEstudiante({ ...estudiante, esEstudiante: false }, '2026-01-01'), 0);
});

test('antigüedad y estudiante no se acumulan: gana el estudiante si es mayor', () => {
  const estudianteVeterano = { ...estudiante, fechaAlta: '2020-01-01' };
  assert.equal(descuentoPersonal(estudianteVeterano, '2026-01-01'), 20);
});

test('antigüedad y estudiante no se acumulan: gana la antigüedad si es mayor', () => {
  const veterano = { ...socioBase, fechaAlta: '2020-01-01' };
  assert.equal(descuentoPersonal(veterano, '2026-01-01'), 15);
});

test('una familia de 2 socios no tiene descuento', () => {
  assert.equal(descuentoPorFamilia(2), 0);
});

test('una familia de 3 socios tiene un 5 %', () => {
  assert.equal(descuentoPorFamilia(3), 5);
});

test('en agosto el plan básico tiene un 25 %', () => {
  assert.equal(descuentoDeVerano('basico', '2026-08-01'), 25);
  assert.equal(descuentoDeVerano('basico', '2026-08-31'), 25);
});

test('fuera de agosto el plan básico no tiene descuento de verano', () => {
  assert.equal(descuentoDeVerano('basico', '2026-07-31'), 0);
  assert.equal(descuentoDeVerano('basico', '2026-09-01'), 0);
});

test('en agosto el plan premium no tiene descuento de verano', () => {
  assert.equal(descuentoDeVerano('premium', '2026-08-15'), 0);
});

test('el descuento total se queda como está hasta el 30 %', () => {
  assert.equal(limitarDescuentoTotal(30), 30);
});

test('el descuento total nunca supera el 30 %', () => {
  assert.equal(limitarDescuentoTotal(31), 30);
});

test('los descuentos acumulables se suman al mayor entre antigüedad y estudiante', () => {
  const veterano = { ...socioBase, plan: 'premium' as const, fechaAlta: '2020-01-01' };
  assert.equal(descuentoTotal(veterano, { fechaCobro: '2026-03-01', sociosEnFamilia: 3 }), 20);
});

test('la suma de descuentos se limita al 30 %', () => {
  const contexto = { fechaCobro: '2026-08-01', sociosEnFamilia: 3 };
  assert.equal(descuentoTotal(estudiante, contexto), 30);
});

test('sin ningún descuento aplicable el total es 0 %', () => {
  assert.equal(descuentoTotal(socioBase, { fechaCobro: '2026-03-01', sociosEnFamilia: 1 }), 0);
});
