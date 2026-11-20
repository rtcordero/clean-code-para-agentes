import { test } from 'node:test';
import assert from 'node:assert/strict';
import { añosCumplidos, fechaDesdeIso, fechaUtcDe } from '../src/dominio/fecha.ts';

test('lee una fecha ISO como fecha de calendario', () => {
  assert.deepEqual(fechaDesdeIso('2024-02-29'), { año: 2024, mes: 2, dia: 29 });
});

test('rechaza una fecha con formato no válido', () => {
  assert.throws(() => fechaDesdeIso('29/02/2024'), /Fecha con formato no válido: 29\/02\/2024/);
});

test('toma la fecha de calendario de un instante en UTC', () => {
  assert.deepEqual(fechaUtcDe(new Date('2026-08-01T00:30:00+02:00')), { año: 2026, mes: 7, dia: 31 });
});

test('los años se cumplen el día del aniversario, no antes', () => {
  const alta = fechaDesdeIso('2024-03-10');

  assert.equal(añosCumplidos(alta, fechaDesdeIso('2026-03-09')), 1);
  assert.equal(añosCumplidos(alta, fechaDesdeIso('2026-03-10')), 2);
  assert.equal(añosCumplidos(alta, fechaDesdeIso('2026-02-28')), 1);
  assert.equal(añosCumplidos(alta, fechaDesdeIso('2026-04-01')), 2);
});

test('quien nace un 29 de febrero cumple años el 1 de marzo en los años no bisiestos', () => {
  const nacimiento = fechaDesdeIso('2000-02-29');

  assert.equal(añosCumplidos(nacimiento, fechaDesdeIso('2026-02-28')), 25);
  assert.equal(añosCumplidos(nacimiento, fechaDesdeIso('2026-03-01')), 26);
});
