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
  socio('s1'),
  socio('p1', { plan: 'premium', familiaId: 'grande' }),
  socio('p2', { familiaId: 'grande' }),
  socio('p3', { familiaId: 'grande' }),
  socio('h1', { plan: 'premium', familiaId: 'pequena' }),
  socio('h2', { familiaId: 'pequena' }),
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

test('aplica el descuento familiar si la familia tiene 3 socios o más', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(repositorio, reloj, 'p1').importeCentimos, 4741);
  assert.equal(cobrarCuota(repositorio, reloj, 'h1').importeCentimos, 4990);
});

test('calcula los descuentos en la fecha que da el reloj', () => {
  const reloj = new RelojFijo(new Date('2026-08-15T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2243, fecha: '2026-08-15' });
});
