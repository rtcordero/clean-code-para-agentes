// Tests de aceptación ocultos: el agente no los ve. Se ejecutan contra cada copia
// con PROYECTO=<ruta de la copia> y solo usan la API pública que la tarea pide conservar.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.PROYECTO;
const { cobrarCuota } = await import(`${base}/src/aplicacion/cobrar-cuota.ts`);
const { RepositorioSociosEnMemoria } = await import(`${base}/src/infraestructura/repositorio-socios.ts`);
const { RelojFijo } = await import(`${base}/src/infraestructura/reloj.ts`);

const MARZO = new Date('2026-03-15T12:00:00Z');
const AGOSTO = new Date('2026-08-10T12:00:00Z');

function socio(cambios) {
  return {
    id: 'x',
    nombre: 'Socio de prueba',
    plan: 'basico',
    fechaAlta: '2025-06-01',
    fechaNacimiento: '1990-05-20',
    esEstudiante: false,
    ...cambios,
  };
}

function importe(datos, fecha = MARZO, otros = []) {
  const repositorio = new RepositorioSociosEnMemoria([datos, ...otros]);
  return cobrarCuota(repositorio, new RelojFijo(fecha), datos.id).importeCentimos;
}

const familia = (id, n) => Array.from({ length: n }, (_, i) => socio({ id: `${id}-${i}`, familiaId: id }));

test('sin descuentos: básico', () => assert.equal(importe(socio({})), 2990));
test('sin descuentos: premium', () => assert.equal(importe(socio({ plan: 'premium' })), 4990));
test('antigüedad: 2 años justos, 10 %', () => assert.equal(importe(socio({ fechaAlta: '2024-03-15' })), 2691));
test('antigüedad: un día antes de 2 años, nada', () => assert.equal(importe(socio({ fechaAlta: '2024-03-16' })), 2990));
test('antigüedad: 5 años en premium, 15 % y redondeo', () => assert.equal(importe(socio({ plan: 'premium', fechaAlta: '2021-03-01' })), 4242));
test('estudiante de 25 años, 20 %', () => assert.equal(importe(socio({ esEstudiante: true, fechaNacimiento: '2001-01-01' })), 2392));
test('estudiante que cumple 26 hoy, nada', () => assert.equal(importe(socio({ esEstudiante: true, fechaNacimiento: '2000-03-15' })), 2990));
test('joven no estudiante, nada', () => assert.equal(importe(socio({ fechaNacimiento: '2005-01-01' })), 2990));
test('estudiante con 5 años: se aplica el mayor (20 %)', () => assert.equal(importe(socio({ esEstudiante: true, fechaNacimiento: '2002-01-01', fechaAlta: '2020-01-01' })), 2392));
test('familia de 3, 5 % y redondeo hacia arriba', () => {
  const [yo, ...resto] = familia('f3', 3);
  assert.equal(importe(yo, MARZO, resto), 2841);
});
test('familia de 2, nada', () => {
  const [yo, ...resto] = familia('f2', 2);
  assert.equal(importe(yo, MARZO, resto), 2990);
});
test('estudiante en familia de 3: 25 %', () => {
  const [yo, ...resto] = familia('f4', 3);
  assert.equal(importe({ ...yo, esEstudiante: true, fechaNacimiento: '2003-01-01' }, MARZO, resto), 2243);
});
test('agosto en básico: 25 %', () => assert.equal(importe(socio({}), AGOSTO), 2243));
test('agosto en premium: nada', () => assert.equal(importe(socio({ plan: 'premium' }), AGOSTO), 4990));
test('tope del 30 %', () => {
  const [yo, ...resto] = familia('f5', 3);
  assert.equal(importe({ ...yo, esEstudiante: true, fechaNacimiento: '2003-01-01' }, AGOSTO, resto), 2093);
});
test('el recibo conserva socioId y fecha', () => {
  const repositorio = new RepositorioSociosEnMemoria([socio({ id: 'r1' })]);
  const recibo = cobrarCuota(repositorio, new RelojFijo(MARZO), 'r1');
  assert.equal(recibo.socioId, 'r1');
  assert.equal(recibo.fecha, '2026-03-15');
});
