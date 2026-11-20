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

test('cobra la cuota del socio con la fecha del día', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2990, fecha: '2026-03-01' });
});

test('falla si el socio no existe', () => {
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.throws(() => cobrarCuota(repositorio, reloj, 'nadie'), /No existe el socio nadie/);
});

test('aplica los descuentos según la fecha que da el reloj', () => {
  const reloj = new RelojFijo(new Date('2026-08-03T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, reloj, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2243, fecha: '2026-08-03' });
});

test('aplica el descuento familiar con 3 socios de la familia en el gimnasio', () => {
  const familia = new RepositorioSociosEnMemoria([
    { ...lucia, familiaId: 'f1' },
    { ...lucia, id: 's2', familiaId: 'f1' },
    { ...lucia, id: 's3', familiaId: 'f1' },
  ]);
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(familia, reloj, 's1').importeCentimos, 2841);
});

test('no aplica el descuento familiar con solo 2 socios de la familia', () => {
  const familia = new RepositorioSociosEnMemoria([
    { ...lucia, familiaId: 'f1' },
    { ...lucia, id: 's2', familiaId: 'f1' },
    { ...lucia, id: 's3', familiaId: 'f2' },
  ]);
  const reloj = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

  assert.equal(cobrarCuota(familia, reloj, 's1').importeCentimos, 2990);
});
