import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aniosCumplidos, leerFecha } from '../src/dominio/fecha.ts';

test('lee una fecha ISO como año, mes y día', () => {
  assert.deepEqual(leerFecha('2026-08-15'), { anio: 2026, mes: 8, dia: 15 });
});

test('los años se cumplen el mismo día del aniversario', () => {
  assert.equal(aniosCumplidos('2024-12-01', '2026-12-01'), 2);
});

test('la víspera del aniversario aún no se ha cumplido el año', () => {
  assert.equal(aniosCumplidos('2024-12-01', '2026-11-30'), 1);
});

test('un mes posterior al del aniversario cuenta el año cumplido', () => {
  assert.equal(aniosCumplidos('2024-03-31', '2026-04-01'), 2);
});

test('un mes anterior al del aniversario no cuenta el año', () => {
  assert.equal(aniosCumplidos('2024-05-01', '2026-04-30'), 1);
});
