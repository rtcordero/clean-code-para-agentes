import type { Socio } from './socio.ts';
import { aniosCumplidos, mesDelAnio } from './fecha.ts';

const SIN_DESCUENTO = 0;
const ANIOS_PARA_ANTIGUEDAD = 2;
const DESCUENTO_ANTIGUEDAD = 10;
const ANIOS_PARA_ANTIGUEDAD_AMPLIADA = 5;
const DESCUENTO_ANTIGUEDAD_AMPLIADA = 15;
const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;
const SOCIOS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIAR = 5;
const MES_AGOSTO = 8;
const DESCUENTO_VERANO = 25;
const DESCUENTO_MAXIMO = 30;

export interface CondicionesDelCobro {
  fechaCobro: Date;
  sociosEnSuFamilia: number;
}

export function descuentoPorAntiguedad(socio: Socio, fechaCobro: Date): number {
  const antiguedad = aniosCumplidos(new Date(socio.fechaAlta), fechaCobro);
  if (antiguedad >= ANIOS_PARA_ANTIGUEDAD_AMPLIADA) {
    return DESCUENTO_ANTIGUEDAD_AMPLIADA;
  }
  if (antiguedad >= ANIOS_PARA_ANTIGUEDAD) {
    return DESCUENTO_ANTIGUEDAD;
  }
  return SIN_DESCUENTO;
}

export function descuentoPorEstudiante(socio: Socio, fechaCobro: Date): number {
  const edad = aniosCumplidos(new Date(socio.fechaNacimiento), fechaCobro);
  if (socio.esEstudiante && edad < EDAD_LIMITE_ESTUDIANTE) {
    return DESCUENTO_ESTUDIANTE;
  }
  return SIN_DESCUENTO;
}

export function descuentoPersonal(socio: Socio, fechaCobro: Date): number {
  return Math.max(descuentoPorAntiguedad(socio, fechaCobro), descuentoPorEstudiante(socio, fechaCobro));
}

export function descuentoFamiliar(sociosEnSuFamilia: number): number {
  return sociosEnSuFamilia >= SOCIOS_MINIMOS_FAMILIA ? DESCUENTO_FAMILIAR : SIN_DESCUENTO;
}

export function descuentoDeVerano(socio: Socio, fechaCobro: Date): number {
  if (socio.plan === 'basico' && mesDelAnio(fechaCobro) === MES_AGOSTO) {
    return DESCUENTO_VERANO;
  }
  return SIN_DESCUENTO;
}

export function porcentajeDeDescuento(socio: Socio, condiciones: CondicionesDelCobro): number {
  const descuentoAcumulado =
    descuentoPersonal(socio, condiciones.fechaCobro) +
    descuentoFamiliar(condiciones.sociosEnSuFamilia) +
    descuentoDeVerano(socio, condiciones.fechaCobro);
  return Math.min(descuentoAcumulado, DESCUENTO_MAXIMO);
}

export function contarSociosDeSuFamilia(socio: Socio, socios: Socio[]): number {
  if (!socio.familiaId) {
    return 0;
  }
  const otrosMiembros = socios.filter(
    (otro) => otro.id !== socio.id && otro.familiaId === socio.familiaId,
  );
  return otrosMiembros.length + 1;
}
