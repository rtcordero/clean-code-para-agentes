import type { Plan, Socio } from './socio.ts';
import { aniosCumplidos, leerFecha } from './fecha.ts';

const ANIOS_PARA_ANTIGUEDAD = 2;
const PORCENTAJE_ANTIGUEDAD = 10;
const ANIOS_PARA_ANTIGUEDAD_AMPLIADA = 5;
const PORCENTAJE_ANTIGUEDAD_AMPLIADA = 15;
const EDAD_LIMITE_ESTUDIANTE = 26;
const PORCENTAJE_ESTUDIANTE = 20;
const MIEMBROS_MINIMOS_FAMILIA = 3;
const PORCENTAJE_FAMILIA = 5;
const MES_DE_AGOSTO = 8;
const PORCENTAJE_VERANO_PLAN_BASICO = 25;
const PORCENTAJE_MAXIMO_DE_DESCUENTO = 30;
const SIN_DESCUENTO = 0;

export interface DatosDelCobro {
  fechaCobro: string;
  miembrosDeLaFamilia: number;
}

export function descuentoPorAntiguedad(fechaAlta: string, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(fechaAlta, fechaCobro);
  if (antiguedad >= ANIOS_PARA_ANTIGUEDAD_AMPLIADA) {
    return PORCENTAJE_ANTIGUEDAD_AMPLIADA;
  }
  if (antiguedad >= ANIOS_PARA_ANTIGUEDAD) {
    return PORCENTAJE_ANTIGUEDAD;
  }
  return SIN_DESCUENTO;
}

export function descuentoPorEstudiante(socio: Socio, fechaCobro: string): number {
  const edad = aniosCumplidos(socio.fechaNacimiento, fechaCobro);
  if (socio.esEstudiante && edad < EDAD_LIMITE_ESTUDIANTE) {
    return PORCENTAJE_ESTUDIANTE;
  }
  return SIN_DESCUENTO;
}

export function descuentoPersonal(socio: Socio, fechaCobro: string): number {
  return Math.max(descuentoPorAntiguedad(socio.fechaAlta, fechaCobro), descuentoPorEstudiante(socio, fechaCobro));
}

export function contarMiembrosDeLaFamilia(socio: Socio, socios: Socio[]): number {
  if (socio.familiaId === undefined) {
    return 0;
  }
  return socios.filter((otroSocio) => otroSocio.familiaId === socio.familiaId).length;
}

export function descuentoPorFamilia(miembrosDeLaFamilia: number): number {
  return miembrosDeLaFamilia >= MIEMBROS_MINIMOS_FAMILIA ? PORCENTAJE_FAMILIA : SIN_DESCUENTO;
}

export function descuentoDeVerano(plan: Plan, fechaCobro: string): number {
  const esAgosto = leerFecha(fechaCobro).mes === MES_DE_AGOSTO;
  return esAgosto && plan === 'basico' ? PORCENTAJE_VERANO_PLAN_BASICO : SIN_DESCUENTO;
}

export function limitarAlDescuentoMaximo(porcentaje: number): number {
  return Math.min(porcentaje, PORCENTAJE_MAXIMO_DE_DESCUENTO);
}

export function porcentajeDeDescuento(socio: Socio, cobro: DatosDelCobro): number {
  const acumulado =
    descuentoPersonal(socio, cobro.fechaCobro) +
    descuentoPorFamilia(cobro.miembrosDeLaFamilia) +
    descuentoDeVerano(socio.plan, cobro.fechaCobro);
  return limitarAlDescuentoMaximo(acumulado);
}
