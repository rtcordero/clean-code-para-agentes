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

function miembroDeFamilia(id: string, familiaId: string): Socio {
  return { ...lucia, id, nombre: `Socio ${id}`, familiaId };
}

const repositorio = new RepositorioSociosEnMemoria([
  lucia,
  { ...lucia, id: 'veterano', fechaAlta: '2021-03-01' },
  miembroDeFamilia('f1', 'garcia'),
  miembroDeFamilia('f2', 'garcia'),
  miembroDeFamilia('f3', 'garcia'),
  miembroDeFamilia('p1', 'perez'),
  miembroDeFamilia('p2', 'perez'),
]);

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
  const vispera = cobrarCuota(repositorio, new RelojFijo(new Date('2026-02-28T09:00:00Z')), 'veterano');
  const aniversario = cobrarCuota(repositorio, new RelojFijo(new Date('2026-03-01T09:00:00Z')), 'veterano');

  assert.equal(vispera.importeCentimos, 2691);
  assert.equal(aniversario.importeCentimos, 2542);
});

test('aplica el descuento familiar si la familia tiene 3 socios en el gimnasio', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, reloj, 'f1').importeCentimos, 2841);
});

test('no aplica el descuento familiar si la familia tiene 2 socios en el gimnasio', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, reloj, 'p1').importeCentimos, 2990);
});

test('aplica el descuento de verano según el mes del reloj', () => {
  const reloj = new RelojFijo(new Date('2026-08-03T09:00:00Z'));

  assert.deepEqual(cobrarCuota(repositorio, reloj, 'f2'), {
    socioId: 'f2',
    importeCentimos: 2093,
    fecha: '2026-08-03',
  });
});
