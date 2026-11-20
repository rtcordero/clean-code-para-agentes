import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cobrarCuota } from '../src/aplicacion/cobrar-cuota.ts';
import type { Socio } from '../src/dominio/socio.ts';
import { RepositorioSociosEnMemoria } from '../src/infraestructura/repositorio-socios.ts';
import { RelojFijo } from '../src/infraestructura/reloj.ts';

const lucia: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const repositorio = new RepositorioSociosEnMemoria([lucia]);

function socioDeFamilia(id: string, familiaId: string): Socio {
  return { ...lucia, id, plan: 'premium', familiaId };
}

test('cobra la cuota del socio con la fecha del día', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2990, fecha: '2026-03-01' });
});

test('falla si el socio no existe', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.throws(() => cobrarCuota(repositorio, reloj, 'nadie'), /No existe el socio nadie/);
});

test('usa la fecha del reloj para la antigüedad y el mes', () => {
  const reloj = new RelojFijo(new Date('2028-08-10T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2093, fecha: '2028-08-10' });
});

test('aplica el descuento de familia cuando hay 3 socios de la familia, contándole a él', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const repositorioConFamilia = new RepositorioSociosEnMemoria([
    socioDeFamilia('f1', 'garcia'),
    socioDeFamilia('f2', 'garcia'),
    socioDeFamilia('f3', 'garcia'),
    socioDeFamilia('otro', 'lopez'),
  ]);

  assert.equal(cobrarCuota(repositorioConFamilia, reloj, 'f1').importeCentimos, 4741);
});

test('no aplica el descuento de familia con 2 socios de la familia', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const repositorioConFamilia = new RepositorioSociosEnMemoria([
    socioDeFamilia('f1', 'garcia'),
    socioDeFamilia('f2', 'garcia'),
    socioDeFamilia('otro', 'lopez'),
  ]);

  assert.equal(cobrarCuota(repositorioConFamilia, reloj, 'f1').importeCentimos, 4990);
});
