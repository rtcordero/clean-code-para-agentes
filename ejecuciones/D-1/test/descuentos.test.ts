import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  descuentoDeVerano,
  descuentoNoAcumulable,
  descuentoPorAntiguedad,
  descuentoPorEstudiante,
  descuentoPorFamilia,
  limitarAlTope,
  porcentajeDeDescuentoTotal,
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

test('antigüedad: sin descuento hasta cumplir 2 años', () => {
  assert.equal(descuentoPorAntiguedad('2024-03-01', '2026-02-28'), 0);
});

test('antigüedad: 10 % el día exacto en que se cumplen 2 años', () => {
  assert.equal(descuentoPorAntiguedad('2024-03-01', '2026-03-01'), 10);
});

test('antigüedad: sigue en 10 % la víspera de cumplir 5 años', () => {
  assert.equal(descuentoPorAntiguedad('2021-03-01', '2026-02-28'), 10);
});

test('antigüedad: 15 % el día exacto en que se cumplen 5 años y después', () => {
  assert.equal(descuentoPorAntiguedad('2021-03-01', '2026-03-01'), 15);
  assert.equal(descuentoPorAntiguedad('2010-03-01', '2026-03-01'), 15);
});

test('estudiante: 20 % la víspera de cumplir 26 años', () => {
  assert.equal(descuentoPorEstudiante(estudiante, '2026-02-28'), 20);
});

test('estudiante: sin descuento el día en que cumple 26 años', () => {
  assert.equal(descuentoPorEstudiante(estudiante, '2026-03-01'), 0);
});

test('estudiante: no aplica a quien no es estudiante aunque sea joven', () => {
  assert.equal(descuentoPorEstudiante({ ...estudiante, esEstudiante: false }, '2026-02-28'), 0);
});

test('antigüedad y estudiante no se acumulan: gana el de estudiante si es mayor', () => {
  const estudianteVeterano = { ...estudiante, fechaAlta: '2020-01-01' };
  assert.equal(descuentoNoAcumulable(estudianteVeterano, '2026-02-28'), 20);
});

test('antigüedad y estudiante no se acumulan: queda la antigüedad si no es estudiante', () => {
  const veterano = { ...socioBase, fechaAlta: '2020-01-01' };
  assert.equal(descuentoNoAcumulable(veterano, '2026-02-28'), 15);
});

test('familia: sin descuento con 2 socios', () => {
  assert.equal(descuentoPorFamilia(2), 0);
});

test('familia: 5 % con 3 socios o más', () => {
  assert.equal(descuentoPorFamilia(3), 5);
  assert.equal(descuentoPorFamilia(4), 5);
});

test('verano: 25 % al plan básico en agosto, del primer al último día', () => {
  assert.equal(descuentoDeVerano('basico', '2026-08-01'), 25);
  assert.equal(descuentoDeVerano('basico', '2026-08-31'), 25);
});

test('verano: no aplica fuera de agosto', () => {
  assert.equal(descuentoDeVerano('basico', '2026-07-31'), 0);
  assert.equal(descuentoDeVerano('basico', '2026-09-01'), 0);
});

test('verano: no aplica al plan premium', () => {
  assert.equal(descuentoDeVerano('premium', '2026-08-15'), 0);
});

test('tope: el descuento total no pasa del 30 %', () => {
  assert.equal(limitarAlTope(29), 29);
  assert.equal(limitarAlTope(30), 30);
  assert.equal(limitarAlTope(31), 30);
});

test('total: sin descuentos que apliquen es 0 %', () => {
  assert.equal(porcentajeDeDescuentoTotal(socioBase, { fechaCobro: '2026-03-01', sociosEnLaFamilia: 1 }), 0);
});

test('total: suma el no acumulable con familia', () => {
  const condiciones = { fechaCobro: '2026-02-28', sociosEnLaFamilia: 3 };
  assert.equal(porcentajeDeDescuentoTotal(estudiante, condiciones), 25);
});

test('total: estudiante, familia y verano suman 50 % y se limitan al 30 %', () => {
  const condiciones = { fechaCobro: '2025-08-10', sociosEnLaFamilia: 3 };
  assert.equal(porcentajeDeDescuentoTotal(estudiante, condiciones), 30);
});
