import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aniosCumplidos, mesDelAnio } from '../src/dominio/fecha.ts';

test('el día antes del aniversario aún no se ha cumplido el año', () => {
  assert.equal(aniosCumplidos(new Date('2020-03-10'), new Date('2026-03-09T23:00:00Z')), 5);
});

test('el día del aniversario se cumple el año', () => {
  assert.equal(aniosCumplidos(new Date('2020-03-10'), new Date('2026-03-10T00:00:00Z')), 6);
});

test('un mes posterior al del aniversario cuenta el año aunque el día sea menor', () => {
  assert.equal(aniosCumplidos(new Date('2020-03-10'), new Date('2026-04-01T12:00:00Z')), 6);
});

test('un nacido el 29 de febrero cumple años el 1 de marzo en años no bisiestos', () => {
  assert.equal(aniosCumplidos(new Date('2000-02-29'), new Date('2026-02-28T12:00:00Z')), 25);
  assert.equal(aniosCumplidos(new Date('2000-02-29'), new Date('2026-03-01T12:00:00Z')), 26);
});

test('el mes del año empieza en 1 para enero', () => {
  assert.equal(mesDelAnio(new Date('2026-01-15T12:00:00Z')), 1);
  assert.equal(mesDelAnio(new Date('2026-08-31T12:00:00Z')), 8);
});
