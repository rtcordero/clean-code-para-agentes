import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aniosCumplidos } from '../src/dominio/fecha.ts';

test('el día del aniversario el año ya está cumplido', () => {
  assert.equal(aniosCumplidos('2024-03-15', '2026-03-15'), 2);
});

test('la víspera del aniversario el año aún no está cumplido', () => {
  assert.equal(aniosCumplidos('2024-03-15', '2026-03-14'), 1);
});

test('un mes antes del aniversario el año aún no está cumplido', () => {
  assert.equal(aniosCumplidos('2024-03-15', '2026-02-20'), 1);
});

test('un mes después del aniversario el año está cumplido aunque el día sea menor', () => {
  assert.equal(aniosCumplidos('2024-03-15', '2026-04-01'), 2);
});

test('quien nació un 29 de febrero cumple el 1 de marzo en años no bisiestos', () => {
  assert.equal(aniosCumplidos('2000-02-29', '2026-02-28'), 25);
  assert.equal(aniosCumplidos('2000-02-29', '2026-03-01'), 26);
});
