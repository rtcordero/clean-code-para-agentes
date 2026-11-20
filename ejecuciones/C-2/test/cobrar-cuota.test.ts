import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cobrarCuota } from '../src/aplicacion/cobrar-cuota.ts';
import { RepositorioSociosEnMemoria } from '../src/infraestructura/repositorio-socios.ts';
import { RelojFijo } from '../src/infraestructura/reloj.ts';

const repositorio = new RepositorioSociosEnMemoria([
  {
    id: 's1',
    nombre: 'Lucía Martín',
    plan: 'basico',
    fechaAlta: '2026-01-10',
    fechaNacimiento: '1990-04-02',
    esEstudiante: false,
  },
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

const miembroDeFamilia = {
  plan: 'premium' as const,
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1980-05-05',
  esEstudiante: false,
};

const repositorioConFamilias = new RepositorioSociosEnMemoria([
  { ...miembroDeFamilia, id: 'f1', nombre: 'Ana Ruiz', familiaId: 'ruiz' },
  { ...miembroDeFamilia, id: 'f2', nombre: 'Pablo Ruiz', familiaId: 'ruiz' },
  { ...miembroDeFamilia, id: 'f3', nombre: 'Marta Ruiz', familiaId: 'ruiz' },
  { ...miembroDeFamilia, id: 'p1', nombre: 'Juan Pérez', familiaId: 'perez' },
  { ...miembroDeFamilia, id: 'p2', nombre: 'Eva Pérez', familiaId: 'perez' },
  {
    id: 'v1',
    nombre: 'Rosa Gil',
    plan: 'basico',
    fechaAlta: '2024-08-01',
    fechaNacimiento: '1985-01-01',
    esEstudiante: false,
  },
]);

test('aplica el descuento familiar contando al socio en su familia', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorioConFamilias, reloj, 'f1').importeCentimos, 4741);
});

test('no aplica el descuento familiar a una familia de 2 socios', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorioConFamilias, reloj, 'p1').importeCentimos, 4990);
});

test('calcula antigüedad y mes con la fecha del reloj', () => {
  const reloj = new RelojFijo(new Date('2026-08-01T09:00:00Z'));

  const recibo = cobrarCuota(repositorioConFamilias, reloj, 'v1');

  assert.deepEqual(recibo, { socioId: 'v1', importeCentimos: 2093, fecha: '2026-08-01' });
});

test('fuera de agosto el mismo socio solo tiene el descuento de antigüedad', () => {
  const reloj = new RelojFijo(new Date('2026-09-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorioConFamilias, reloj, 'v1').importeCentimos, 2691);
});
