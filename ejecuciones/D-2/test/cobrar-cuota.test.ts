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

test('aplica los descuentos con la fecha del reloj y la familia del repositorio', () => {
  const familia = new RepositorioSociosEnMemoria([
    { id: 'f1', nombre: 'Ana Ruiz', plan: 'premium', fechaAlta: '2021-08-01', fechaNacimiento: '1980-01-01', esEstudiante: false, familiaId: 'ruiz' },
    { id: 'f2', nombre: 'Pablo Ruiz', plan: 'basico', fechaAlta: '2026-01-01', fechaNacimiento: '2008-01-01', esEstudiante: true, familiaId: 'ruiz' },
    { id: 'f3', nombre: 'Marta Ruiz', plan: 'basico', fechaAlta: '2026-01-01', fechaNacimiento: '2010-01-01', esEstudiante: true, familiaId: 'ruiz' },
  ]);
  const reloj = new RelojFijo(new Date('2026-08-01T09:00:00Z'));

  const recibo = cobrarCuota(familia, reloj, 'f1');

  assert.deepEqual(recibo, { socioId: 'f1', importeCentimos: 3992, fecha: '2026-08-01' });
});

test('la antigüedad se calcula en la fecha del cobro', () => {
  const socioAntiguo = new RepositorioSociosEnMemoria([
    { id: 's2', nombre: 'Luis Gil', plan: 'premium', fechaAlta: '2024-03-01', fechaNacimiento: '1985-05-05', esEstudiante: false },
  ]);

  const vispera = cobrarCuota(socioAntiguo, new RelojFijo(new Date('2026-02-28T09:00:00Z')), 's2');
  const aniversario = cobrarCuota(socioAntiguo, new RelojFijo(new Date('2026-03-01T09:00:00Z')), 's2');

  assert.equal(vispera.importeCentimos, 4990);
  assert.equal(aniversario.importeCentimos, 4491);
});

test('falla si el socio no existe', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.throws(() => cobrarCuota(repositorio, reloj, 'nadie'), /No existe el socio nadie/);
});
