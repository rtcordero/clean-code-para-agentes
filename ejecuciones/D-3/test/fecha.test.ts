import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aniosCumplidos, mesDe } from '../src/dominio/fecha.ts';

test('el día antes del aniversario aún no se ha cumplido el año', () => {
  assert.equal(aniosCumplidos('2024-03-01', '2026-02-28'), 1);
});

test('el mismo día del aniversario el año está cumplido', () => {
  assert.equal(aniosCumplidos('2024-03-01', '2026-03-01'), 2);
});

test('un mes posterior al del aniversario cuenta el año aunque el día sea menor', () => {
  assert.equal(aniosCumplidos('2024-03-15', '2026-04-01'), 2);
});

test('nacido un 29 de febrero cumple el 1 de marzo en años no bisiestos', () => {
  assert.equal(aniosCumplidos('2024-02-29', '2026-02-28'), 1);
  assert.equal(aniosCumplidos('2024-02-29', '2026-03-01'), 2);
});

test('el mes de una fecha ISO', () => {
  assert.equal(mesDe('2026-08-31'), 8);
});
