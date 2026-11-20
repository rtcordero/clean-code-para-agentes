import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota } from '../src/dominio/cuota.ts';
import type { CondicionesCobro } from '../src/dominio/descuentos.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const sinDescuentos: CondicionesCobro = { fechaCobro: '2026-03-01', sociosEnFamilia: 1 };

describe('tarifas', () => {
  test('el plan básico cuesta 29,90 €', () => {
    assert.equal(calcularCuota(socioBase, sinDescuentos), 2990);
  });

  test('el plan premium cuesta 49,90 €', () => {
    assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, sinDescuentos), 4990);
  });
});

describe('antigüedad', () => {
  const socio: Socio = { ...socioBase, fechaAlta: '2024-03-01' };

  test('sin 2 años cumplidos no hay descuento', () => {
    assert.equal(calcularCuota(socio, { ...sinDescuentos, fechaCobro: '2026-02-28' }), 2990);
  });

  test('con 2 años cumplidos descuenta un 10 %', () => {
    assert.equal(calcularCuota(socio, { ...sinDescuentos, fechaCobro: '2026-03-01' }), 2691);
  });

  test('con 5 años cumplidos descuenta un 15 %', () => {
    const premiumAntiguo: Socio = { ...socio, plan: 'premium', fechaAlta: '2021-03-01' };

    assert.equal(calcularCuota(premiumAntiguo, sinDescuentos), 4242);
  });
});

describe('estudiantes', () => {
  const estudiante: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-02' };

  test('un estudiante que aún no ha cumplido 26 años tiene un 20 %', () => {
    assert.equal(calcularCuota(estudiante, { ...sinDescuentos, fechaCobro: '2026-03-01' }), 2392);
  });

  test('un estudiante que ya ha cumplido 26 años no tiene descuento', () => {
    assert.equal(calcularCuota(estudiante, { ...sinDescuentos, fechaCobro: '2026-03-02' }), 2990);
  });

  test('quien no es estudiante no tiene el descuento aunque sea joven', () => {
    const joven: Socio = { ...estudiante, esEstudiante: false };

    assert.equal(calcularCuota(joven, sinDescuentos), 2990);
  });

  test('no se acumula con la antigüedad: se aplica el mayor', () => {
    const estudianteAntiguo: Socio = { ...estudiante, plan: 'premium', fechaAlta: '2020-01-01' };

    assert.equal(calcularCuota(estudianteAntiguo, sinDescuentos), 3992);
  });
});

describe('familias', () => {
  test('con 3 socios en la familia descuenta un 5 %', () => {
    assert.equal(calcularCuota(socioBase, { ...sinDescuentos, sociosEnFamilia: 3 }), 2841);
  });

  test('con 2 socios en la familia no hay descuento', () => {
    assert.equal(calcularCuota(socioBase, { ...sinDescuentos, sociosEnFamilia: 2 }), 2990);
  });

  test('se acumula con la antigüedad', () => {
    const premiumAntiguo: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2024-01-01' };

    assert.equal(calcularCuota(premiumAntiguo, { ...sinDescuentos, sociosEnFamilia: 3 }), 4242);
  });
});

describe('verano', () => {
  const agosto: CondicionesCobro = { ...sinDescuentos, fechaCobro: '2026-08-01' };

  test('en agosto el plan básico tiene un 25 % y redondea el medio céntimo hacia arriba', () => {
    assert.equal(calcularCuota(socioBase, agosto), 2243);
  });

  test('en agosto el plan premium no tiene descuento', () => {
    assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, agosto), 4990);
  });

  test('fuera de agosto el plan básico no tiene descuento', () => {
    assert.equal(calcularCuota(socioBase, { ...sinDescuentos, fechaCobro: '2026-09-01' }), 2990);
  });
});

describe('tope', () => {
  test('el descuento total nunca supera el 30 %', () => {
    const estudiante: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };

    const cuota = calcularCuota(estudiante, { fechaCobro: '2026-08-01', sociosEnFamilia: 3 });

    assert.equal(cuota, 2093);
  });
});
