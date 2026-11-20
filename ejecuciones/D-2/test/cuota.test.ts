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

test('aplicar un descuento exacto no redondea', () => {
  assert.equal(aplicarDescuento(2990, 10), 2691);
  assert.equal(aplicarDescuento(2990, 0), 2990);
});

test('el medio céntimo se redondea hacia arriba', () => {
  assert.equal(aplicarDescuento(4990, 15), 4242);
  assert.equal(aplicarDescuento(2990, 5), 2841);
});

test('por debajo del medio céntimo se redondea hacia abajo', () => {
  assert.equal(aplicarDescuento(4990, 13), 4341);
});

test('sin descuentos que apliquen, la cuota es la tarifa del plan', () => {
  assert.equal(calcularCuotaConDescuentos(socioBase, { fechaCobro: '2026-12-01', miembrosDeLaFamilia: 0 }), 2990);
});

test('la cuota con descuentos aplica el porcentaje total limitado al 30 %', () => {
  const estudiante = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
  assert.equal(calcularCuotaConDescuentos(estudiante, { fechaCobro: '2026-08-10', miembrosDeLaFamilia: 3 }), 2093);
});

test('un premium con 5 años y familia numerosa paga un 20 % menos', () => {
  const premium = { ...socioBase, plan: 'premium' as const, fechaAlta: '2021-12-01' };
  assert.equal(calcularCuotaConDescuentos(premium, { fechaCobro: '2026-12-01', miembrosDeLaFamilia: 3 }), 3992);
});
