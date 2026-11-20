import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aniosCumplidos, leerFechaIso, mesDe } from '../src/dominio/fecha.ts';

test('lee una fecha ISO como año, mes y día', () => {
  assert.deepEqual(leerFechaIso('2026-08-05'), { anio: 2026, mes: 8, dia: 5 });
});

test('el mes de una fecha ISO empieza en 1', () => {
  assert.equal(mesDe('2026-01-31'), 1);
  assert.equal(mesDe('2026-08-01'), 8);
});

test('los años se cumplen el mismo día del aniversario, no antes', () => {
  assert.equal(aniosCumplidos('2024-03-01', '2026-02-28'), 1);
  assert.equal(aniosCumplidos('2024-03-01', '2026-03-01'), 2);
});

test('en el mes del aniversario cuenta el día', () => {
  assert.equal(aniosCumplidos('2024-03-15', '2026-03-14'), 1);
  assert.equal(aniosCumplidos('2024-03-15', '2026-03-15'), 2);
});

test('quien nació un 29 de febrero cumple años el 1 de marzo en años no bisiestos', () => {
  assert.equal(aniosCumplidos('2000-02-29', '2026-02-28'), 25);
  assert.equal(aniosCumplidos('2000-02-29', '2026-03-01'), 26);
});
