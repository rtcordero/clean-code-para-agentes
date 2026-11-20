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

function familiaGarcia(miembros: number): Socio[] {
  return Array.from({ length: miembros }, (_, indice) => ({
    ...lucia,
    id: `g${indice}`,
    plan: 'premium' as const,
    familiaId: 'garcia',
  }));
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

test('calcula la antigüedad en la fecha del reloj', () => {
  const reloj = new RelojFijo(new Date('2028-01-10T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2691, fecha: '2028-01-10' });
});

test('aplica el descuento de verano si el reloj está en agosto', () => {
  const reloj = new RelojFijo(new Date('2026-08-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, reloj, 's1').importeCentimos, 2243);
});

test('aplica el descuento familiar contando al propio socio entre los 3', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const conFamilia = new RepositorioSociosEnMemoria([lucia, ...familiaGarcia(3)]);

  assert.equal(cobrarCuota(conFamilia, reloj, 'g0').importeCentimos, 4741);
});

test('no aplica el descuento familiar con solo 2 socios en la familia', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const conFamilia = new RepositorioSociosEnMemoria([lucia, ...familiaGarcia(2)]);

  assert.equal(cobrarCuota(conFamilia, reloj, 'g0').importeCentimos, 4990);
});

test('los socios sin familia no cuentan como una familia entre sí', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));
  const sinFamilia = new RepositorioSociosEnMemoria([lucia, { ...lucia, id: 's2' }, { ...lucia, id: 's3' }]);

  assert.equal(cobrarCuota(sinFamilia, reloj, 's1').importeCentimos, 2990);
});
