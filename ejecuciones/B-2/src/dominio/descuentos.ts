import { aniosCumplidos, mesDe } from './fecha.ts';
import type { Socio } from './socio.ts';

export interface CondicionesCobro {
  fechaCobro: string;
  sociosEnFamilia: number;
}

const DESCUENTO_MAXIMO = 30;

const ANIOS_ANTIGUEDAD_ALTA = 5;
const DESCUENTO_ANTIGUEDAD_ALTA = 15;
const ANIOS_ANTIGUEDAD_MEDIA = 2;
const DESCUENTO_ANTIGUEDAD_MEDIA = 10;

const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;

const SOCIOS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIA = 5;

const AGOSTO = 8;
const DESCUENTO_VERANO = 25;

export function porcentajeDescuento(socio: Socio, condiciones: CondicionesCobro): number {
  const descuentoPersonal = Math.max(
    descuentoAntiguedad(socio, condiciones.fechaCobro),
    descuentoEstudiante(socio, condiciones.fechaCobro),
  );
  const descuentoTotal =
    descuentoPersonal +
    descuentoFamilia(condiciones.sociosEnFamilia) +
    descuentoVerano(socio, condiciones.fechaCobro);
  return Math.min(descuentoTotal, DESCUENTO_MAXIMO);
}

function descuentoAntiguedad(socio: Socio, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(socio.fechaAlta, fechaCobro);
  if (antiguedad >= ANIOS_ANTIGUEDAD_ALTA) {
    return DESCUENTO_ANTIGUEDAD_ALTA;
  }
  if (antiguedad >= ANIOS_ANTIGUEDAD_MEDIA) {
    return DESCUENTO_ANTIGUEDAD_MEDIA;
  }
  return 0;
}

function descuentoEstudiante(socio: Socio, fechaCobro: string): number {
  const edad = aniosCumplidos(socio.fechaNacimiento, fechaCobro);
  return socio.esEstudiante && edad < EDAD_LIMITE_ESTUDIANTE ? DESCUENTO_ESTUDIANTE : 0;
}

function descuentoFamilia(sociosEnFamilia: number): number {
  return sociosEnFamilia >= SOCIOS_MINIMOS_FAMILIA ? DESCUENTO_FAMILIA : 0;
}

function descuentoVerano(socio: Socio, fechaCobro: string): number {
  return socio.plan === 'basico' && mesDe(fechaCobro) === AGOSTO ? DESCUENTO_VERANO : 0;
}
