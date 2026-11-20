import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cobrarCuota } from '../src/aplicacion/cobrar-cuota.ts';
import { RepositorioSociosEnMemoria } from '../src/infraestructura/repositorio-socios.ts';
import { RelojFijo } from '../src/infraestructura/reloj.ts';
import type { Socio } from '../src/dominio/socio.ts';

const lucia: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const repositorio = new RepositorioSociosEnMemoria([lucia]);

test('cobra la cuota del socio con la fecha del día', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2990, fecha: '2026-03-01' });
});

test('falla si el socio no existe', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.throws(() => cobrarCuota(repositorio, reloj, 'nadie'), /No existe el socio nadie/);
});

test('calcula la antigüedad en la fecha del reloj', () => {
  const veterano = { ...lucia, fechaAlta: '2024-03-01' };
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  const recibo = cobrarCuota(new RepositorioSociosEnMemoria([veterano]), reloj, 's1');

  assert.equal(recibo.importeCentimos, 2691);
});

test('aplica el descuento de verano según el mes del reloj', () => {
  const reloj = new RelojFijo(new Date('2026-08-01T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2243, fecha: '2026-08-01' });
});

function familiar(id: string, familiaId: string): Socio {
  return { ...lucia, id, familiaId };
}

test('aplica el descuento de familia si hay 3 socios con la misma familia, contándole a él', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const repositorioFamiliar = new RepositorioSociosEnMemoria([
    familiar('s1', 'f1'),
    familiar('s2', 'f1'),
    familiar('s3', 'f1'),
    familiar('s4', 'f2'),
  ]);

  assert.equal(cobrarCuota(repositorioFamiliar, reloj, 's1').importeCentimos, 2841);
});

test('no aplica el descuento de familia con 2 socios de la misma familia', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const repositorioFamiliar = new RepositorioSociosEnMemoria([
    familiar('s1', 'f1'),
    familiar('s2', 'f1'),
    familiar('s3', 'f2'),
  ]);

  assert.equal(cobrarCuota(repositorioFamiliar, reloj, 's1').importeCentimos, 2990);
});

test('los socios sin familia no cuentan como una familia entre sí', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const repositorioSinFamilias = new RepositorioSociosEnMemoria([
    lucia,
    { ...lucia, id: 's2' },
    { ...lucia, id: 's3' },
  ]);

  assert.equal(cobrarCuota(repositorioSinFamilias, reloj, 's1').importeCentimos, 2990);
});
