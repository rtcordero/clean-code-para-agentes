import { aniosCumplidos, mesDe } from './fecha.ts';
import type { Plan, Socio } from './socio.ts';

const SIN_DESCUENTO = 0;

const ANIOS_ANTIGUEDAD_INICIAL = 2;
const PORCENTAJE_ANTIGUEDAD_INICIAL = 10;
const ANIOS_ANTIGUEDAD_SUPERIOR = 5;
const PORCENTAJE_ANTIGUEDAD_SUPERIOR = 15;

const EDAD_LIMITE_ESTUDIANTE = 26;
const PORCENTAJE_ESTUDIANTE = 20;

const MINIMO_SOCIOS_FAMILIA = 3;
const PORCENTAJE_FAMILIA = 5;

const MES_AGOSTO = 8;
const PORCENTAJE_VERANO_PLAN_BASICO = 25;

export const TOPE_DESCUENTO_TOTAL = 30;

export interface CondicionesDelCobro {
  fechaCobro: string;
  sociosEnLaFamilia: number;
}

export function descuentoPorAntiguedad(fechaAlta: string, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(fechaAlta, fechaCobro);
  if (antiguedad >= ANIOS_ANTIGUEDAD_SUPERIOR) {
    return PORCENTAJE_ANTIGUEDAD_SUPERIOR;
  }
  if (antiguedad >= ANIOS_ANTIGUEDAD_INICIAL) {
    return PORCENTAJE_ANTIGUEDAD_INICIAL;
  }
  return SIN_DESCUENTO;
}

export function descuentoPorEstudiante(socio: Socio, fechaCobro: string): number {
  if (!socio.esEstudiante) {
    return SIN_DESCUENTO;
  }
  const edad = aniosCumplidos(socio.fechaNacimiento, fechaCobro);
  return edad < EDAD_LIMITE_ESTUDIANTE ? PORCENTAJE_ESTUDIANTE : SIN_DESCUENTO;
}

export function descuentoNoAcumulable(socio: Socio, fechaCobro: string): number {
  return Math.max(
    descuentoPorAntiguedad(socio.fechaAlta, fechaCobro),
    descuentoPorEstudiante(socio, fechaCobro),
  );
}

export function descuentoPorFamilia(sociosEnLaFamilia: number): number {
  return sociosEnLaFamilia >= MINIMO_SOCIOS_FAMILIA ? PORCENTAJE_FAMILIA : SIN_DESCUENTO;
}

export function descuentoDeVerano(plan: Plan, fechaCobro: string): number {
  const esAgosto = mesDe(fechaCobro) === MES_AGOSTO;
  return esAgosto && plan === 'basico' ? PORCENTAJE_VERANO_PLAN_BASICO : SIN_DESCUENTO;
}

export function limitarAlTope(porcentajeAcumulado: number): number {
  return Math.min(porcentajeAcumulado, TOPE_DESCUENTO_TOTAL);
}

export function porcentajeDeDescuentoTotal(socio: Socio, condiciones: CondicionesDelCobro): number {
  const acumulado =
    descuentoNoAcumulable(socio, condiciones.fechaCobro) +
    descuentoPorFamilia(condiciones.sociosEnLaFamilia) +
    descuentoDeVerano(socio.plan, condiciones.fechaCobro);
  return limitarAlTope(acumulado);
}
