import { añosCumplidos, fechaDesdeIso, type FechaCalendario } from './fecha.ts';
import type { Plan, Socio } from './socio.ts';

export interface ContextoDeCobro {
  fecha: FechaCalendario;
  sociosDeSuFamilia: number;
}

const TARIFA_EN_CENTIMOS: Record<Plan, number> = {
  basico: 2990,
  premium: 4990,
};

const DESCUENTO_MAXIMO = 30;

const AÑOS_ANTIGUEDAD_ALTA = 5;
const DESCUENTO_ANTIGUEDAD_ALTA = 15;
const AÑOS_ANTIGUEDAD_BASE = 2;
const DESCUENTO_ANTIGUEDAD_BASE = 10;

const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;

const SOCIOS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIA = 5;

const MES_DE_VERANO = 8;
const DESCUENTO_VERANO_BASICO = 25;

export function calcularCuota(socio: Socio, contexto: ContextoDeCobro): number {
  return aplicarDescuento(TARIFA_EN_CENTIMOS[socio.plan], porcentajeDeDescuento(socio, contexto));
}

export function porcentajeDeDescuento(socio: Socio, contexto: ContextoDeCobro): number {
  const descuentoPrincipal = Math.max(
    descuentoPorAntiguedad(socio, contexto.fecha),
    descuentoDeEstudiante(socio, contexto.fecha),
  );
  const descuentoTotal =
    descuentoPrincipal +
    descuentoFamiliar(contexto.sociosDeSuFamilia) +
    descuentoDeVerano(socio, contexto.fecha);
  return Math.min(descuentoTotal, DESCUENTO_MAXIMO);
}

function descuentoPorAntiguedad(socio: Socio, fecha: FechaCalendario): number {
  const antiguedad = añosCumplidos(fechaDesdeIso(socio.fechaAlta), fecha);
  if (antiguedad >= AÑOS_ANTIGUEDAD_ALTA) {
    return DESCUENTO_ANTIGUEDAD_ALTA;
  }
  if (antiguedad >= AÑOS_ANTIGUEDAD_BASE) {
    return DESCUENTO_ANTIGUEDAD_BASE;
  }
  return 0;
}

function descuentoDeEstudiante(socio: Socio, fecha: FechaCalendario): number {
  const edad = añosCumplidos(fechaDesdeIso(socio.fechaNacimiento), fecha);
  return socio.esEstudiante && edad < EDAD_LIMITE_ESTUDIANTE ? DESCUENTO_ESTUDIANTE : 0;
}

function descuentoFamiliar(sociosDeSuFamilia: number): number {
  return sociosDeSuFamilia >= SOCIOS_MINIMOS_FAMILIA ? DESCUENTO_FAMILIA : 0;
}

function descuentoDeVerano(socio: Socio, fecha: FechaCalendario): number {
  return socio.plan === 'basico' && fecha.mes === MES_DE_VERANO ? DESCUENTO_VERANO_BASICO : 0;
}

function aplicarDescuento(importeEnCentimos: number, porcentaje: number): number {
  // Aritmética entera para redondear exactamente: medio céntimo hacia arriba.
  return Math.floor((importeEnCentimos * (100 - porcentaje) + 50) / 100);
}
