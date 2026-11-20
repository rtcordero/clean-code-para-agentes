import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota, type ContextoCobro } from '../src/dominio/cuota.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const contextoBase: ContextoCobro = { fechaCobro: '2026-03-01', sociosEnFamilia: 1 };

function cuota(socio: Partial<Socio>, contexto: Partial<ContextoCobro> = {}): number {
  return calcularCuota({ ...socioBase, ...socio }, { ...contextoBase, ...contexto });
}

describe('tarifa sin descuentos', () => {
  test('el plan básico cuesta 29,90 €', () => {
    assert.equal(cuota({}), 2990);
  });

  test('el plan premium cuesta 49,90 €', () => {
    assert.equal(cuota({ plan: 'premium' }), 4990);
  });
});

describe('antigüedad', () => {
  test('sin 2 años cumplidos no hay descuento', () => {
    assert.equal(cuota({ fechaAlta: '2024-03-02' }), 2990);
  });

  test('con 2 años cumplidos justo el día del cobro, 10 %', () => {
    assert.equal(cuota({ fechaAlta: '2024-03-01' }), 2691);
  });

  test('con 5 años cumplidos, 15 %', () => {
    assert.equal(cuota({ fechaAlta: '2021-03-01' }), 2542);
  });

  test('con 4 años cumplidos sigue siendo 10 %', () => {
    assert.equal(cuota({ fechaAlta: '2021-03-02' }), 2691);
  });
});

describe('estudiantes', () => {
  test('estudiante con 25 años, 20 %', () => {
    assert.equal(cuota({ esEstudiante: true, fechaNacimiento: '2000-03-02' }), 2392);
  });

  test('estudiante que cumple 26 años el día del cobro, sin descuento', () => {
    assert.equal(cuota({ esEstudiante: true, fechaNacimiento: '2000-03-01' }), 2990);
  });

  test('menor de 26 que no es estudiante, sin descuento', () => {
    assert.equal(cuota({ esEstudiante: false, fechaNacimiento: '2005-01-01' }), 2990);
  });
});

describe('antigüedad y estudiante no se acumulan', () => {
  test('se aplica el de estudiante si es mayor', () => {
    const socio = { esEstudiante: true, fechaNacimiento: '2005-01-01', fechaAlta: '2021-01-01' };
    assert.equal(cuota(socio), 2392);
  });
});

describe('familias', () => {
  test('con 3 socios en la familia, 5 %', () => {
    assert.equal(cuota({}, { sociosEnFamilia: 3 }), 2841);
  });

  test('con 2 socios en la familia, sin descuento', () => {
    assert.equal(cuota({}, { sociosEnFamilia: 2 }), 2990);
  });

  test('se acumula con la antigüedad', () => {
    assert.equal(cuota({ fechaAlta: '2021-03-01' }, { sociosEnFamilia: 3 }), 2392);
  });
});

describe('verano', () => {
  test('en agosto el plan básico tiene un 25 %', () => {
    assert.equal(cuota({}, { fechaCobro: '2026-08-15' }), 2243);
  });

  test('en agosto el plan premium no tiene descuento de verano', () => {
    assert.equal(cuota({ plan: 'premium' }, { fechaCobro: '2026-08-15' }), 4990);
  });

  test('fuera de agosto no hay descuento de verano', () => {
    assert.equal(cuota({}, { fechaCobro: '2026-09-01' }), 2990);
  });
});

describe('tope del 30 %', () => {
  test('verano y familia suman justo el 30 %', () => {
    assert.equal(cuota({}, { fechaCobro: '2026-08-01', sociosEnFamilia: 3 }), 2093);
  });

  test('estudiante, familia y verano se limitan al 30 %', () => {
    const socio = { esEstudiante: true, fechaNacimiento: '2005-01-01' };
    assert.equal(cuota(socio, { fechaCobro: '2026-08-01', sociosEnFamilia: 4 }), 2093);
  });
});

describe('redondeo', () => {
  test('el medio céntimo se redondea hacia arriba (49,90 € con 15 % = 42,415 €)', () => {
    assert.equal(cuota({ plan: 'premium', fechaAlta: '2021-03-01' }), 4242);
  });

  test('el medio céntimo se redondea hacia arriba (49,90 € con 5 % = 47,405 €)', () => {
    assert.equal(cuota({ plan: 'premium' }, { sociosEnFamilia: 3 }), 4741);
  });
});
