import { aniosCumplidos, leerFecha } from './fecha.ts';
import type { Plan, Socio } from './socio.ts';

export interface ContextoDeCobro {
  fechaCobro: string;
  sociosEnFamilia: number;
}

const SIN_DESCUENTO = 0;

const ANIOS_ANTIGUEDAD_MAXIMA = 5;
const DESCUENTO_ANTIGUEDAD_MAXIMA = 15;
const ANIOS_ANTIGUEDAD_MINIMA = 2;
const DESCUENTO_ANTIGUEDAD_MINIMA = 10;

const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;

const SOCIOS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIA = 5;

const AGOSTO = 8;
const DESCUENTO_VERANO_PLAN_BASICO = 25;

const DESCUENTO_TOTAL_MAXIMO = 30;

export function descuentoPorAntiguedad(fechaAlta: string, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(fechaAlta, fechaCobro);
  if (antiguedad >= ANIOS_ANTIGUEDAD_MAXIMA) {
    return DESCUENTO_ANTIGUEDAD_MAXIMA;
  }
  if (antiguedad >= ANIOS_ANTIGUEDAD_MINIMA) {
    return DESCUENTO_ANTIGUEDAD_MINIMA;
  }
  return SIN_DESCUENTO;
}

export function descuentoPorEstudiante(socio: Socio, fechaCobro: string): number {
  const edad = aniosCumplidos(socio.fechaNacimiento, fechaCobro);
  if (socio.esEstudiante && edad < EDAD_LIMITE_ESTUDIANTE) {
    return DESCUENTO_ESTUDIANTE;
  }
  return SIN_DESCUENTO;
}

export function descuentoPersonal(socio: Socio, fechaCobro: string): number {
  return Math.max(
    descuentoPorAntiguedad(socio.fechaAlta, fechaCobro),
    descuentoPorEstudiante(socio, fechaCobro),
  );
}

export function descuentoPorFamilia(sociosEnFamilia: number): number {
  return sociosEnFamilia >= SOCIOS_MINIMOS_FAMILIA ? DESCUENTO_FAMILIA : SIN_DESCUENTO;
}

export function descuentoDeVerano(plan: Plan, fechaCobro: string): number {
  const esAgosto = leerFecha(fechaCobro).mes === AGOSTO;
  return esAgosto && plan === 'basico' ? DESCUENTO_VERANO_PLAN_BASICO : SIN_DESCUENTO;
}

export function limitarDescuentoTotal(porcentajeAcumulado: number): number {
  return Math.min(porcentajeAcumulado, DESCUENTO_TOTAL_MAXIMO);
}

export function descuentoTotal(socio: Socio, contexto: ContextoDeCobro): number {
  const porcentajeAcumulado =
    descuentoPersonal(socio, contexto.fechaCobro) +
    descuentoPorFamilia(contexto.sociosEnFamilia) +
    descuentoDeVerano(socio.plan, contexto.fechaCobro);
  return limitarDescuentoTotal(porcentajeAcumulado);
}
