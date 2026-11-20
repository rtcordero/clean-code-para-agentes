import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cobrarCuota } from '../src/aplicacion/cobrar-cuota.ts';
import { RepositorioSociosEnMemoria } from '../src/infraestructura/repositorio-socios.ts';
import { RelojFijo } from '../src/infraestructura/reloj.ts';
import type { Socio } from '../src/dominio/socio.ts';

function socio(id: string, datos: Partial<Socio> = {}): Socio {
  return {
    id,
    nombre: `Socio ${id}`,
    plan: 'basico',
    fechaAlta: '2026-01-10',
    fechaNacimiento: '1990-04-02',
    esEstudiante: false,
    ...datos,
  };
}

const repositorio = new RepositorioSociosEnMemoria([
  socio('s1', { nombre: 'Lucía Martín' }),
  socio('veterano', { fechaAlta: '2024-03-01' }),
  socio('f1', { familiaId: 'garcia' }),
  socio('f2', { familiaId: 'garcia' }),
  socio('f3', { familiaId: 'garcia' }),
  socio('p1', { familiaId: 'perez' }),
  socio('p2', { familiaId: 'perez' }),
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

test('la antigüedad se calcula en la fecha del reloj', () => {
  const antesDelAniversario = new RelojFijo(new Date('2026-02-28T09:00:00Z'));
  const enElAniversario = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, antesDelAniversario, 'veterano').importeCentimos, 2990);
  assert.equal(cobrarCuota(repositorio, enElAniversario, 'veterano').importeCentimos, 2691);
});

test('el mes de verano se toma del reloj', () => {
  const reloj = new RelojFijo(new Date('2026-08-01T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2243, fecha: '2026-08-01' });
});

test('cuenta los socios de la familia en el repositorio', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, reloj, 'f1').importeCentimos, 2841);
  assert.equal(cobrarCuota(repositorio, reloj, 'p1').importeCentimos, 2990);
});
