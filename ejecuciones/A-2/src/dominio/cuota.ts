import type { Plan, Socio } from './socio.ts';
import { AGOSTO, aniosCumplidos, fechaDesdeIso, type FechaCalendario } from './fecha.ts';

const TARIFA_CENTIMOS: Record<Plan, number> = {
  basico: 2990,
  premium: 4990,
};

const DESCUENTO_MAXIMO = 30;

const ANTIGUEDAD_LARGA_ANIOS = 5;
const DESCUENTO_ANTIGUEDAD_LARGA = 15;
const ANTIGUEDAD_MEDIA_ANIOS = 2;
const DESCUENTO_ANTIGUEDAD_MEDIA = 10;

const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;

const MIEMBROS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIA = 5;

const DESCUENTO_VERANO_BASICO = 25;

export interface ContextoCobro {
  fechaCobro: FechaCalendario;
  /** Socios del gimnasio con la misma familiaId, contando al propio socio. */
  sociosEnSuFamilia: number;
}

export function calcularCuota(socio: Socio, contexto: ContextoCobro): number {
  const tarifa = TARIFA_CENTIMOS[socio.plan];
  return aplicarDescuento(tarifa, porcentajeDescuento(socio, contexto));
}

function porcentajeDescuento(socio: Socio, contexto: ContextoCobro): number {
  const porPerfil = Math.max(
    descuentoPorAntiguedad(socio, contexto.fechaCobro),
    descuentoPorEstudiante(socio, contexto.fechaCobro),
  );
  const total =
    porPerfil +
    descuentoPorFamilia(contexto.sociosEnSuFamilia) +
    descuentoPorVerano(socio, contexto.fechaCobro);
  return Math.min(total, DESCUENTO_MAXIMO);
}

function descuentoPorAntiguedad(socio: Socio, fechaCobro: FechaCalendario): number {
  const antiguedad = aniosCumplidos(fechaDesdeIso(socio.fechaAlta), fechaCobro);
  if (antiguedad >= ANTIGUEDAD_LARGA_ANIOS) return DESCUENTO_ANTIGUEDAD_LARGA;
  if (antiguedad >= ANTIGUEDAD_MEDIA_ANIOS) return DESCUENTO_ANTIGUEDAD_MEDIA;
  return 0;
}

function descuentoPorEstudiante(socio: Socio, fechaCobro: FechaCalendario): number {
  if (!socio.esEstudiante) return 0;
  const edad = aniosCumplidos(fechaDesdeIso(socio.fechaNacimiento), fechaCobro);
  return edad < EDAD_LIMITE_ESTUDIANTE ? DESCUENTO_ESTUDIANTE : 0;
}

function descuentoPorFamilia(sociosEnSuFamilia: number): number {
  return sociosEnSuFamilia >= MIEMBROS_MINIMOS_FAMILIA ? DESCUENTO_FAMILIA : 0;
}

function descuentoPorVerano(socio: Socio, fechaCobro: FechaCalendario): number {
  return socio.plan === 'basico' && fechaCobro.mes === AGOSTO ? DESCUENTO_VERANO_BASICO : 0;
}

// Aritmética entera: redondea al céntimo más cercano, el medio céntimo hacia arriba.
function aplicarDescuento(importeCentimos: number, porcentaje: number): number {
  return Math.floor((importeCentimos * (100 - porcentaje) + 50) / 100);
}
