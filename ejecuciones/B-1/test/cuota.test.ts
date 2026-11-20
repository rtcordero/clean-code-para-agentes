import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCuota, type ContextoDeCobro } from '../src/dominio/cuota.ts';
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
  sociosEnFamilia: 1,
};

describe('tarifas sin descuento', () => {
  test('el plan básico cuesta 29,90 €', () => {
    assert.equal(calcularCuota(socioBase, contextoBase), 2990);
  });

  test('el plan premium cuesta 49,90 €', () => {
    assert.equal(calcularCuota({ ...socioBase, plan: 'premium' }, contextoBase), 4990);
  });
});

describe('antigüedad', () => {
  const socio: Socio = { ...socioBase, plan: 'premium', fechaAlta: '2020-03-15' };

  test('sin 2 años cumplidos no hay descuento', () => {
    assert.equal(calcularCuota(socio, { ...contextoBase, fechaCobro: '2022-03-14' }), 4990);
  });

  test('con 2 años cumplidos el día del aniversario, 10 %', () => {
    assert.equal(calcularCuota(socio, { ...contextoBase, fechaCobro: '2022-03-15' }), 4491);
  });

  test('sin 5 años cumplidos sigue siendo 10 %', () => {
    assert.equal(calcularCuota(socio, { ...contextoBase, fechaCobro: '2025-03-14' }), 4491);
  });

  test('con 5 años cumplidos, 15 %', () => {
    assert.equal(calcularCuota(socio, { ...contextoBase, fechaCobro: '2025-03-15' }), 4242);
  });
});

describe('estudiantes', () => {
  const estudiante: Socio = {
    ...socioBase,
    plan: 'premium',
    esEstudiante: true,
    fechaNacimiento: '2000-06-20',
  };

  test('con menos de 26 años, 20 %', () => {
    assert.equal(calcularCuota(estudiante, { ...contextoBase, fechaCobro: '2026-06-19' }), 3992);
  });

  test('el día que cumple 26 años pierde el descuento', () => {
    assert.equal(calcularCuota(estudiante, { ...contextoBase, fechaCobro: '2026-06-20' }), 4990);
  });

  test('si no es estudiante no hay descuento por edad', () => {
    const noEstudiante = { ...estudiante, esEstudiante: false };
    assert.equal(calcularCuota(noEstudiante, { ...contextoBase, fechaCobro: '2026-06-19' }), 4990);
  });

  test('no se acumula con la antigüedad: se aplica el mayor', () => {
    const veterano = { ...estudiante, fechaAlta: '2018-01-01' };
    assert.equal(calcularCuota(veterano, { ...contextoBase, fechaCobro: '2026-03-01' }), 3992);
  });
});

describe('familias', () => {
  const socio: Socio = { ...socioBase, plan: 'premium', familiaId: 'f1' };

  test('con 3 socios en la familia, 5 %', () => {
    assert.equal(calcularCuota(socio, { ...contextoBase, sociosEnFamilia: 3 }), 4741);
  });

  test('con 2 socios en la familia no hay descuento', () => {
    assert.equal(calcularCuota(socio, { ...contextoBase, sociosEnFamilia: 2 }), 4990);
  });

  test('se acumula con la antigüedad', () => {
    const veterano = { ...socio, fechaAlta: '2020-01-01' };
    assert.equal(calcularCuota(veterano, { ...contextoBase, sociosEnFamilia: 3 }), 3992);
  });
});

describe('verano', () => {
  test('en agosto el plan básico tiene un 25 %', () => {
    assert.equal(calcularCuota(socioBase, { ...contextoBase, fechaCobro: '2026-08-01' }), 2243);
  });

  test('en agosto el plan premium no tiene descuento', () => {
    const premium: Socio = { ...socioBase, plan: 'premium' };
    assert.equal(calcularCuota(premium, { ...contextoBase, fechaCobro: '2026-08-31' }), 4990);
  });

  test('fuera de agosto el plan básico no tiene descuento', () => {
    assert.equal(calcularCuota(socioBase, { ...contextoBase, fechaCobro: '2026-09-01' }), 2990);
  });
});

describe('tope y redondeo', () => {
  test('el descuento total nunca supera el 30 %', () => {
    const estudianteEnFamilia: Socio = {
      ...socioBase,
      esEstudiante: true,
      fechaNacimiento: '2005-01-01',
    };
    const contexto = { fechaCobro: '2026-08-10', sociosEnFamilia: 4 };
    assert.equal(calcularCuota(estudianteEnFamilia, contexto), 2093);
  });

  test('el medio céntimo se redondea hacia arriba', () => {
    const veterano: Socio = { ...socioBase, fechaAlta: '2020-01-01' };
    assert.equal(calcularCuota(veterano, contextoBase), 2542);
  });
});
