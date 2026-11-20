import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  descuentoDeVerano,
  descuentoFamiliar,
  descuentoNoAcumulable,
  descuentoPorAntiguedad,
  descuentoPorEstudiante,
  descuentoTotal,
  limitarAlDescuentoMaximo,
} from '../src/dominio/descuentos.ts';
import { fechaDesdeTexto } from '../src/dominio/fecha.ts';
import type { Socio } from '../src/dominio/socio.ts';

const fecha = fechaDesdeTexto;

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'premium',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

describe('descuento por antigüedad', () => {
  const alta = fecha('2020-06-15');

  test('sin 2 años cumplidos no hay descuento', () => {
    assert.equal(descuentoPorAntiguedad(alta, fecha('2022-06-14')), 0);
  });

  test('con 2 años justos cumplidos es del 10 %', () => {
    assert.equal(descuentoPorAntiguedad(alta, fecha('2022-06-15')), 10);
  });

  test('la víspera de los 5 años sigue siendo del 10 %', () => {
    assert.equal(descuentoPorAntiguedad(alta, fecha('2025-06-14')), 10);
  });

  test('con 5 años justos cumplidos es del 15 %', () => {
    assert.equal(descuentoPorAntiguedad(alta, fecha('2025-06-15')), 15);
  });

  test('con más de 5 años sigue siendo del 15 %', () => {
    assert.equal(descuentoPorAntiguedad(alta, fecha('2035-01-01')), 15);
  });
});

describe('descuento de estudiante', () => {
  const estudiante: Socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-09-20' };

  test('un estudiante de menos de 26 años tiene un 20 %', () => {
    assert.equal(descuentoPorEstudiante(estudiante, fecha('2026-09-19')), 20);
  });

  test('el día que cumple 26 años ya no lo tiene', () => {
    assert.equal(descuentoPorEstudiante(estudiante, fecha('2026-09-20')), 0);
  });

  test('quien no es estudiante no lo tiene aunque sea joven', () => {
    const joven: Socio = { ...estudiante, esEstudiante: false };
    assert.equal(descuentoPorEstudiante(joven, fecha('2020-01-01')), 0);
  });
});

describe('antigüedad y estudiante no se acumulan', () => {
  const estudianteVeterano: Socio = {
    ...socioBase,
    esEstudiante: true,
    fechaNacimiento: '2002-01-01',
    fechaAlta: '2019-01-01',
  };

  test('se aplica el de estudiante cuando es mayor', () => {
    assert.equal(descuentoNoAcumulable(estudianteVeterano, fecha('2026-03-01')), 20);
  });

  test('se aplica el de antigüedad cuando el de estudiante ya no aplica', () => {
    assert.equal(descuentoNoAcumulable(estudianteVeterano, fecha('2028-03-01')), 15);
  });
});

describe('descuento familiar', () => {
  test('una familia de 2 socios no tiene descuento', () => {
    assert.equal(descuentoFamiliar(2), 0);
  });

  test('una familia de 3 socios tiene un 5 %', () => {
    assert.equal(descuentoFamiliar(3), 5);
  });

  test('una familia de más de 3 socios tiene un 5 %', () => {
    assert.equal(descuentoFamiliar(6), 5);
  });
});

describe('descuento de verano', () => {
  test('el plan básico tiene un 25 % el primer día de agosto', () => {
    assert.equal(descuentoDeVerano('basico', fecha('2026-08-01')), 25);
  });

  test('el plan básico tiene un 25 % el último día de agosto', () => {
    assert.equal(descuentoDeVerano('basico', fecha('2026-08-31')), 25);
  });

  test('el plan básico no lo tiene en julio ni en septiembre', () => {
    assert.equal(descuentoDeVerano('basico', fecha('2026-07-31')), 0);
    assert.equal(descuentoDeVerano('basico', fecha('2026-09-01')), 0);
  });

  test('el plan premium no lo tiene en agosto', () => {
    assert.equal(descuentoDeVerano('premium', fecha('2026-08-15')), 0);
  });
});

describe('descuento total', () => {
  test('el tope es del 30 %', () => {
    assert.equal(limitarAlDescuentoMaximo(29), 29);
    assert.equal(limitarAlDescuentoMaximo(30), 30);
    assert.equal(limitarAlDescuentoMaximo(31), 30);
  });

  test('suma el mayor no acumulable con el familiar', () => {
    const socio: Socio = { ...socioBase, fechaAlta: '2020-01-01' };
    const datos = { fechaCobro: fecha('2026-03-01'), sociosEnFamilia: 3 };
    assert.equal(descuentoTotal(socio, datos), 20);
  });

  test('suma antigüedad, familia y verano sin pasar del 30 %', () => {
    const socio: Socio = { ...socioBase, plan: 'basico', fechaAlta: '2020-01-01' };
    const datos = { fechaCobro: fecha('2026-08-10'), sociosEnFamilia: 3 };
    assert.equal(descuentoTotal(socio, datos), 30);
  });

  test('sin ningún descuento aplicable es 0', () => {
    const datos = { fechaCobro: fecha('2026-03-01'), sociosEnFamilia: 1 };
    assert.equal(descuentoTotal(socioBase, datos), 0);
  });
});
