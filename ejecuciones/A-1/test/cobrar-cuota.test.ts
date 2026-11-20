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

function socioDeLaFamilia(id: string, familiaId: string): Socio {
  return { ...lucia, id, nombre: `Socio ${id}`, familiaId };
}

const repositorio = new RepositorioSociosEnMemoria([
  lucia,
  { ...lucia, id: 's2', nombre: 'Marta Gil', fechaAlta: '2024-03-01' },
  socioDeLaFamilia('f1-a', 'f1'),
  socioDeLaFamilia('f1-b', 'f1'),
  socioDeLaFamilia('f1-c', 'f1'),
  socioDeLaFamilia('f2-a', 'f2'),
  socioDeLaFamilia('f2-b', 'f2'),
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

test('calcula la antigüedad en la fecha del cobro que da el reloj', () => {
  const antesDelAniversario = new RelojFijo(new Date('2026-02-28T23:30:00Z'));
  const enElAniversario = new RelojFijo(new Date('2026-03-01T00:30:00Z'));

  assert.equal(cobrarCuota(repositorio, antesDelAniversario, 's2').importeCentimos, 2990);
  assert.equal(cobrarCuota(repositorio, enElAniversario, 's2').importeCentimos, 2691);
});

test('aplica el descuento familiar contando a los socios de su familia en el gimnasio', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, reloj, 'f1-a').importeCentimos, 2841);
  assert.equal(cobrarCuota(repositorio, reloj, 'f2-a').importeCentimos, 2990);
});

test('aplica el descuento de verano cuando el reloj marca agosto', () => {
  const reloj = new RelojFijo(new Date('2026-08-10T09:00:00Z'));

  assert.deepEqual(cobrarCuota(repositorio, reloj, 's1'), {
    socioId: 's1',
    importeCentimos: 2243,
    fecha: '2026-08-10',
  });
});
