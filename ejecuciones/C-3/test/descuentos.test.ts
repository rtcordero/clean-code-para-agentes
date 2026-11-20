import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contarSociosDeSuFamilia,
  descuentoDeVerano,
  descuentoFamiliar,
  descuentoPersonal,
  descuentoPorAntiguedad,
  descuentoPorEstudiante,
  porcentajeDeDescuento,
} from '../src/dominio/descuentos.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const cobroEnMarzo = new Date('2026-03-10T12:00:00Z');

describe('descuento por antigüedad', () => {
  test('sin 2 años cumplidos no hay descuento', () => {
    const socio = { ...socioBase, fechaAlta: '2024-03-11' };
    assert.equal(descuentoPorAntiguedad(socio, cobroEnMarzo), 0);
  });

  test('el día que cumple 2 años tiene un 10 %', () => {
    const socio = { ...socioBase, fechaAlta: '2024-03-10' };
    assert.equal(descuentoPorAntiguedad(socio, cobroEnMarzo), 10);
  });

  test('el día antes de cumplir 5 años sigue con un 10 %', () => {
    const socio = { ...socioBase, fechaAlta: '2021-03-11' };
    assert.equal(descuentoPorAntiguedad(socio, cobroEnMarzo), 10);
  });

  test('el día que cumple 5 años tiene un 15 %', () => {
    const socio = { ...socioBase, fechaAlta: '2021-03-10' };
    assert.equal(descuentoPorAntiguedad(socio, cobroEnMarzo), 15);
  });
});

describe('descuento de estudiante', () => {
  test('un estudiante de 25 años tiene un 20 %', () => {
    const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-11' };
    assert.equal(descuentoPorEstudiante(socio, cobroEnMarzo), 20);
  });

  test('el día que cumple 26 años pierde el descuento', () => {
    const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2000-03-10' };
    assert.equal(descuentoPorEstudiante(socio, cobroEnMarzo), 0);
  });

  test('quien no es estudiante no tiene descuento aunque sea joven', () => {
    const socio = { ...socioBase, esEstudiante: false, fechaNacimiento: '2005-01-01' };
    assert.equal(descuentoPorEstudiante(socio, cobroEnMarzo), 0);
  });
});

describe('descuento personal: antigüedad y estudiante no se acumulan', () => {
  test('se aplica el de estudiante si es mayor', () => {
    const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2002-01-01', fechaAlta: '2020-01-01' };
    assert.equal(descuentoPersonal(socio, cobroEnMarzo), 20);
  });

  test('se aplica el de antigüedad si no hay de estudiante', () => {
    const socio = { ...socioBase, fechaAlta: '2020-01-01' };
    assert.equal(descuentoPersonal(socio, cobroEnMarzo), 15);
  });
});

describe('descuento familiar', () => {
  test('con 2 socios en la familia no hay descuento', () => {
    assert.equal(descuentoFamiliar(2), 0);
  });

  test('con 3 socios en la familia hay un 5 %', () => {
    assert.equal(descuentoFamiliar(3), 5);
  });
});

describe('descuento de verano', () => {
  test('el plan básico tiene un 25 % en agosto', () => {
    assert.equal(descuentoDeVerano(socioBase, new Date('2026-08-01T00:00:00Z')), 25);
    assert.equal(descuentoDeVerano(socioBase, new Date('2026-08-31T23:59:59Z')), 25);
  });

  test('fuera de agosto no aplica', () => {
    assert.equal(descuentoDeVerano(socioBase, new Date('2026-07-31T23:59:59Z')), 0);
    assert.equal(descuentoDeVerano(socioBase, new Date('2026-09-01T00:00:00Z')), 0);
  });

  test('el plan premium no lo tiene', () => {
    const socio: Socio = { ...socioBase, plan: 'premium' };
    assert.equal(descuentoDeVerano(socio, new Date('2026-08-15T12:00:00Z')), 0);
  });
});

describe('porcentaje de descuento total', () => {
  const cobroEnAgosto = new Date('2026-08-15T12:00:00Z');

  test('sin ninguna regla aplicable es 0', () => {
    assert.equal(porcentajeDeDescuento(socioBase, { fechaCobro: cobroEnMarzo, sociosEnSuFamilia: 0 }), 0);
  });

  test('suma el descuento personal y el familiar', () => {
    const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
    assert.equal(porcentajeDeDescuento(socio, { fechaCobro: cobroEnMarzo, sociosEnSuFamilia: 3 }), 25);
  });

  test('llega justo al 30 % con verano y familia', () => {
    assert.equal(porcentajeDeDescuento(socioBase, { fechaCobro: cobroEnAgosto, sociosEnSuFamilia: 3 }), 30);
  });

  test('nunca supera el 30 %', () => {
    const socio = { ...socioBase, esEstudiante: true, fechaNacimiento: '2005-01-01' };
    assert.equal(porcentajeDeDescuento(socio, { fechaCobro: cobroEnAgosto, sociosEnSuFamilia: 3 }), 30);
  });
});

describe('socios de su familia', () => {
  const madre: Socio = { ...socioBase, id: 'madre', familiaId: 'f1' };
  const hijo: Socio = { ...socioBase, id: 'hijo', familiaId: 'f1' };
  const hija: Socio = { ...socioBase, id: 'hija', familiaId: 'f1' };
  const vecino: Socio = { ...socioBase, id: 'vecino', familiaId: 'f2' };
  const sinFamilia: Socio = { ...socioBase, id: 'solo' };

  test('cuenta a todos los de su familia, incluido él', () => {
    assert.equal(contarSociosDeSuFamilia(madre, [madre, hijo, hija, vecino, sinFamilia]), 3);
  });

  test('le cuenta aunque no venga en la lista', () => {
    assert.equal(contarSociosDeSuFamilia(madre, [hijo, hija]), 3);
  });

  test('quien no pertenece a una familia no cuenta a otros socios sin familia', () => {
    const otroSinFamilia: Socio = { ...socioBase, id: 'otro' };
    assert.equal(contarSociosDeSuFamilia(sinFamilia, [sinFamilia, otroSinFamilia, socioBase]), 0);
  });
});
