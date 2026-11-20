import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contarMiembrosDeLaFamilia,
  descuentoDeVerano,
  descuentoPersonal,
  descuentoPorAntiguedad,
  descuentoPorEstudiante,
  descuentoPorFamilia,
  limitarAlDescuentoMaximo,
  porcentajeDeDescuento,
} from '../src/dominio/descuentos.ts';
import type { Socio } from '../src/dominio/socio.ts';

const FECHA_COBRO = '2026-12-01';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

test('antigüedad: sin 2 años cumplidos no hay descuento', () => {
  assert.equal(descuentoPorAntiguedad('2024-12-02', FECHA_COBRO), 0);
});

test('antigüedad: el día exacto de los 2 años, 10 %', () => {
  assert.equal(descuentoPorAntiguedad('2024-12-01', FECHA_COBRO), 10);
});

test('antigüedad: con 4 años cumplidos sigue el 10 %', () => {
  assert.equal(descuentoPorAntiguedad('2021-12-02', FECHA_COBRO), 10);
});

test('antigüedad: el día exacto de los 5 años, 15 %', () => {
  assert.equal(descuentoPorAntiguedad('2021-12-01', FECHA_COBRO), 15);
});

test('estudiante: con 25 años, 20 %', () => {
  const estudiante = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-12-02' };
  assert.equal(descuentoPorEstudiante(estudiante, FECHA_COBRO), 20);
});

test('estudiante: el día que cumple 26 años ya no hay descuento', () => {
  const estudiante = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-12-01' };
  assert.equal(descuentoPorEstudiante(estudiante, FECHA_COBRO), 0);
});

test('estudiante: si no es estudiante no hay descuento aunque sea joven', () => {
  const joven = { ...socioBase, fechaNacimiento: '2005-01-01' };
  assert.equal(descuentoPorEstudiante(joven, FECHA_COBRO), 0);
});

test('antigüedad y estudiante no se acumulan: se aplica el de estudiante si es mayor', () => {
  const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2002-01-01', fechaAlta: '2020-01-01' };
  assert.equal(descuentoPersonal(socio, FECHA_COBRO), 20);
});

test('antigüedad y estudiante no se acumulan: sin estudiante queda la antigüedad', () => {
  const socio = { ...socioBase, fechaAlta: '2020-01-01' };
  assert.equal(descuentoPersonal(socio, FECHA_COBRO), 15);
});

test('familia: cuenta a los socios de la misma familia, incluido él', () => {
  const socio = { ...socioBase, familiaId: 'f1' };
  const socios = [socio, { ...socioBase, id: 's2', familiaId: 'f1' }, { ...socioBase, id: 's3', familiaId: 'f2' }];
  assert.equal(contarMiembrosDeLaFamilia(socio, socios), 2);
});

test('familia: un socio sin familia no tiene miembros aunque otros tampoco la tengan', () => {
  const socios = [socioBase, { ...socioBase, id: 's2' }, { ...socioBase, id: 's3' }];
  assert.equal(contarMiembrosDeLaFamilia(socioBase, socios), 0);
});

test('familia: con 2 socios no hay descuento', () => {
  assert.equal(descuentoPorFamilia(2), 0);
});

test('familia: con 3 socios, 5 %', () => {
  assert.equal(descuentoPorFamilia(3), 5);
});

test('verano: el plan básico en agosto tiene 25 %', () => {
  assert.equal(descuentoDeVerano('basico', '2026-08-01'), 25);
  assert.equal(descuentoDeVerano('basico', '2026-08-31'), 25);
});

test('verano: fuera de agosto no hay descuento', () => {
  assert.equal(descuentoDeVerano('basico', '2026-07-31'), 0);
  assert.equal(descuentoDeVerano('basico', '2026-09-01'), 0);
});

test('verano: el plan premium no tiene descuento en agosto', () => {
  assert.equal(descuentoDeVerano('premium', '2026-08-15'), 0);
});

test('tope: el descuento no supera el 30 %', () => {
  assert.equal(limitarAlDescuentoMaximo(29), 29);
  assert.equal(limitarAlDescuentoMaximo(30), 30);
  assert.equal(limitarAlDescuentoMaximo(31), 30);
});

test('los descuentos acumulables se suman', () => {
  const estudiante = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  assert.equal(porcentajeDeDescuento(estudiante, { fechaCobro: FECHA_COBRO, miembrosDeLaFamilia: 3 }), 25);
  assert.equal(porcentajeDeDescuento(socioBase, { fechaCobro: '2026-08-01', miembrosDeLaFamilia: 3 }), 30);
  const premiumAntiguo = { ...socioBase, plan: 'premium' as const, fechaAlta: '2024-08-01' };
  assert.equal(porcentajeDeDescuento(premiumAntiguo, { fechaCobro: '2026-08-01', miembrosDeLaFamilia: 3 }), 15);
});

test('la suma de descuentos se limita al 30 %', () => {
  const estudiante = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  assert.equal(porcentajeDeDescuento(estudiante, { fechaCobro: '2026-08-10', miembrosDeLaFamilia: 3 }), 30);
});

test('sin ninguna regla que aplique no hay descuento', () => {
  assert.equal(porcentajeDeDescuento(socioBase, { fechaCobro: FECHA_COBRO, miembrosDeLaFamilia: 1 }), 0);
});
