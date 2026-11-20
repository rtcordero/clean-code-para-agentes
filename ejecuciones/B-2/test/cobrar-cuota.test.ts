import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cobrarCuota } from '../src/aplicacion/cobrar-cuota.ts';
import type { Socio } from '../src/dominio/socio.ts';
import { RepositorioSociosEnMemoria } from '../src/infraestructura/repositorio-socios.ts';
import { RelojFijo } from '../src/infraestructura/reloj.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const repositorio = new RepositorioSociosEnMemoria([
  socioBase,
  { ...socioBase, id: 'f1', familiaId: 'garcia' },
  { ...socioBase, id: 'f2', familiaId: 'garcia' },
  { ...socioBase, id: 'f3', familiaId: 'garcia' },
  { ...socioBase, id: 'p1', familiaId: 'perez' },
  { ...socioBase, id: 'p2', familiaId: 'perez' },
]);

const relojDeMarzo = new RelojFijo(new Date('2026-03-01T09:00:00Z'));

test('cobra la cuota del socio con la fecha del día', () => {
  const recibo = cobrarCuota(repositorio, relojDeMarzo, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2990, fecha: '2026-03-01' });
});

test('falla si el socio no existe', () => {
  assert.throws(() => cobrarCuota(repositorio, relojDeMarzo, 'nadie'), /No existe el socio nadie/);
});

test('aplica el descuento familiar contando al propio socio', () => {
  const recibo = cobrarCuota(repositorio, relojDeMarzo, 'f1');

  assert.equal(recibo.importeCentimos, 2841);
});

test('no aplica el descuento familiar a familias de menos de 3 socios', () => {
  const recibo = cobrarCuota(repositorio, relojDeMarzo, 'p1');

  assert.equal(recibo.importeCentimos, 2990);
});

test('calcula los descuentos en la fecha que da el reloj', () => {
  const relojDeAgosto = new RelojFijo(new Date('2026-08-03T09:00:00Z'));

  const recibo = cobrarCuota(repositorio, relojDeAgosto, 's1');

  assert.deepEqual(recibo, { socioId: 's1', importeCentimos: 2243, fecha: '2026-08-03' });
});
