import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anosCumplidos, fechaDesdeTexto } from '../src/dominio/fecha.ts';

test('convierte un texto ISO en una fecha', () => {
  assert.deepEqual(fechaDesdeTexto('2026-08-31'), { anio: 2026, mes: 8, dia: 31 });
});

test('el día del aniversario los años ya están cumplidos', () => {
  assert.equal(anosCumplidos(fechaDesdeTexto('2024-03-15'), fechaDesdeTexto('2026-03-15')), 2);
});

test('la víspera del aniversario aún no están cumplidos', () => {
  assert.equal(anosCumplidos(fechaDesdeTexto('2024-03-15'), fechaDesdeTexto('2026-03-14')), 1);
});

test('un mes antes del aniversario aún no están cumplidos', () => {
  assert.equal(anosCumplidos(fechaDesdeTexto('2024-03-15'), fechaDesdeTexto('2026-02-20')), 1);
});

test('quien nació un 29 de febrero cumple el 1 de marzo en años no bisiestos', () => {
  const nacimiento = fechaDesdeTexto('2000-02-29');
  assert.equal(anosCumplidos(nacimiento, fechaDesdeTexto('2026-02-28')), 25);
  assert.equal(anosCumplidos(nacimiento, fechaDesdeTexto('2026-03-01')), 26);
});
