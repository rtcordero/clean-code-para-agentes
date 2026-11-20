import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota } from '../src/dominio/cuota.ts';
import type { ContextoDeCobro } from '../src/dominio/descuento.ts';
import type { Socio } from '../src/dominio/socio.ts';

const socioBase: Socio = {
  id: 's1',
  nombre: 'Lucía Martín',
  plan: 'basico',
  fechaAlta: '2026-01-10',
  fechaNacimiento: '1990-04-02',
  esEstudiante: false,
};

const contextoBase: ContextoDeCobro = {
  fechaCobro: '2026-03-01',
  sociosDeSuFamilia: 1,
};

function cuota(socio: Partial<Socio>, contexto: Partial<ContextoDeCobro> = {}): number {
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

describe('descuento por antigüedad', () => {
  test('no hay descuento el día antes de cumplir 2 años', () => {
    assert.equal(cuota({ fechaAlta: '2024-03-02' }), 2990);
  });

  test('el día en que se cumplen 2 años se aplica un 10 %', () => {
    assert.equal(cuota({ fechaAlta: '2024-03-01' }), 2691);
  });

  test('el día antes de cumplir 5 años se mantiene el 10 %', () => {
    assert.equal(cuota({ fechaAlta: '2021-03-02' }), 2691);
  });

  test('con 5 años cumplidos se aplica un 15 %, redondeando el medio céntimo hacia arriba', () => {
    assert.equal(cuota({ fechaAlta: '2021-03-01' }), 2542);
  });
});

describe('descuento de estudiante', () => {
  test('un estudiante de 25 años tiene un 20 %', () => {
    assert.equal(cuota({ esEstudiante: true, fechaNacimiento: '2000-03-02' }), 2392);
  });

  test('un estudiante que ya ha cumplido 26 años no tiene descuento', () => {
    assert.equal(cuota({ esEstudiante: true, fechaNacimiento: '2000-03-01' }), 2990);
  });

  test('un menor de 26 años que no es estudiante no tiene descuento', () => {
    assert.equal(cuota({ esEstudiante: false, fechaNacimiento: '2005-01-01' }), 2990);
  });

  test('no se acumula con la antigüedad: se aplica el mayor', () => {
    const estudianteConAntiguedad = {
      esEstudiante: true,
      fechaNacimiento: '2002-01-01',
      fechaAlta: '2020-01-01',
    };
    assert.equal(cuota(estudianteConAntiguedad), 2392);
  });
});

describe('descuento familiar', () => {
  test('con 2 socios en la familia no hay descuento', () => {
    assert.equal(cuota({}, { sociosDeSuFamilia: 2 }), 2990);
  });

  test('con 3 socios en la familia se aplica un 5 %', () => {
    assert.equal(cuota({}, { sociosDeSuFamilia: 3 }), 2841);
  });

  test('se acumula con la antigüedad', () => {
    assert.equal(cuota({ fechaAlta: '2024-01-01' }, { sociosDeSuFamilia: 3 }), 2542);
  });
});

describe('descuento de verano', () => {
  test('en agosto el plan básico tiene un 25 %', () => {
    assert.equal(cuota({}, { fechaCobro: '2026-08-01' }), 2243);
  });

  test('en agosto el plan premium no tiene descuento', () => {
    assert.equal(cuota({ plan: 'premium' }, { fechaCobro: '2026-08-15' }), 4990);
  });

  test('fuera de agosto no hay descuento', () => {
    assert.equal(cuota({}, { fechaCobro: '2026-09-01' }), 2990);
  });
});

describe('tope del descuento total', () => {
  test('la suma de descuentos nunca supera el 30 %', () => {
    const estudianteEnFamilia = { esEstudiante: true, fechaNacimiento: '2005-01-01' };
    const contextoEnAgosto = { fechaCobro: '2026-08-01', sociosDeSuFamilia: 3 };
    assert.equal(cuota(estudianteEnFamilia, contextoEnAgosto), 2093);
  });

  test('un descuento que suma justo el 30 % se aplica entero', () => {
    const contextoEnAgosto = { fechaCobro: '2026-08-01', sociosDeSuFamilia: 3 };
    assert.equal(cuota({}, contextoEnAgosto), 2093);
  });
});
