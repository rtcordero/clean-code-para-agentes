import type { Plan, Socio } from './socio.ts';
import { aniosCumplidos, mesDe } from './fecha.ts';

export interface CondicionesDelCobro {
  fechaCobro: string;
  sociosEnFamilia: number;
}

const SIN_DESCUENTO = 0;

const ANIOS_ANTIGUEDAD_MEDIA = 2;
const DESCUENTO_ANTIGUEDAD_MEDIA = 10;
const ANIOS_ANTIGUEDAD_ALTA = 5;
const DESCUENTO_ANTIGUEDAD_ALTA = 15;

const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;

const SOCIOS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIA = 5;

const MES_AGOSTO = 8;
const DESCUENTO_VERANO_PLAN_BASICO = 25;

export const DESCUENTO_MAXIMO = 30;

export function descuentoPorAntiguedad(fechaAlta: string, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(fechaAlta, fechaCobro);
  if (antiguedad >= ANIOS_ANTIGUEDAD_ALTA) {
    return DESCUENTO_ANTIGUEDAD_ALTA;
  }
  if (antiguedad >= ANIOS_ANTIGUEDAD_MEDIA) {
    return DESCUENTO_ANTIGUEDAD_MEDIA;
  }
  return SIN_DESCUENTO;
}

export function descuentoPorEstudiante(socio: Socio, fechaCobro: string): number {
  if (!socio.esEstudiante) {
    return SIN_DESCUENTO;
  }
  const edad = aniosCumplidos(socio.fechaNacimiento, fechaCobro);
  return edad < EDAD_LIMITE_ESTUDIANTE ? DESCUENTO_ESTUDIANTE : SIN_DESCUENTO;
}

export function descuentoNoAcumulable(socio: Socio, fechaCobro: string): number {
  return Math.max(
    descuentoPorAntiguedad(socio.fechaAlta, fechaCobro),
    descuentoPorEstudiante(socio, fechaCobro),
  );
}

export function descuentoPorFamilia(sociosEnFamilia: number): number {
  return sociosEnFamilia >= SOCIOS_MINIMOS_FAMILIA ? DESCUENTO_FAMILIA : SIN_DESCUENTO;
}

export function descuentoDeVerano(plan: Plan, fechaCobro: string): number {
  const esAgosto = mesDe(fechaCobro) === MES_AGOSTO;
  return plan === 'basico' && esAgosto ? DESCUENTO_VERANO_PLAN_BASICO : SIN_DESCUENTO;
}

export function limitarAlDescuentoMaximo(porcentaje: number): number {
  return Math.min(porcentaje, DESCUENTO_MAXIMO);
}

export function descuentoTotal(socio: Socio, condiciones: CondicionesDelCobro): number {
  const sumaDeDescuentos =
    descuentoNoAcumulable(socio, condiciones.fechaCobro) +
    descuentoPorFamilia(condiciones.sociosEnFamilia) +
    descuentoDeVerano(socio.plan, condiciones.fechaCobro);
  return limitarAlDescuentoMaximo(sumaDeDescuentos);
}
