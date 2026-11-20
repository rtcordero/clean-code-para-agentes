import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cobrarCuota } from '../src/aplicacion/cobrar-cuota.ts';
import type { Socio } from '../src/dominio/socio.ts';
import { RepositorioSociosEnMemoria } from '../src/infraestructura/repositorio-socios.ts';
import { RelojFijo } from '../src/infraestructura/reloj.ts';

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
  socio('s1'),
  socio('veterano', { fechaAlta: '2024-03-01' }),
  socio('padre', { familiaId: 'f1' }),
  socio('madre', { familiaId: 'f1' }),
  socio('hija', { familiaId: 'f1' }),
  socio('tio', { familiaId: 'f2' }),
  socio('sobrino', { familiaId: 'f2' }),
]);

const marzo = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

test('cobra la cuota del socio con la fecha del día', () => {
  const recibo = cobrarCuota(repositorio, marzo, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2990, fecha: '2026-03-01' });
});

test('calcula la antigüedad en la fecha que da el reloj', () => {
  const unDiaAntes = new RelojFijo(new Date('2026-02-28T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, unDiaAntes, 'veterano').importeCentimos, 2990);
  assert.equal(cobrarCuota(repositorio, marzo, 'veterano').importeCentimos, 2691);
});

test('aplica el descuento familiar si la familia tiene 3 socios en el gimnasio', () => {
  assert.equal(cobrarCuota(repositorio, marzo, 'hija').importeCentimos, 2841);
});

test('no aplica el descuento familiar si la familia tiene menos de 3 socios', () => {
  assert.equal(cobrarCuota(repositorio, marzo, 'sobrino').importeCentimos, 2990);
});

test('aplica el descuento de verano si el reloj marca agosto', () => {
  const agosto = new RelojFijo(new Date('2026-08-03T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, agosto, 's1').importeCentimos, 2243);
});

test('falla si el socio no existe', () => {
  assert.throws(() => cobrarCuota(repositorio, marzo, 'nadie'), /No existe el socio nadie/);
});
