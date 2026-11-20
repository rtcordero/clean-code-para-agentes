import { aniosCumplidos, mesDe } from './fecha.ts';
import type { Plan, Socio } from './socio.ts';

export interface ContextoDeCobro {
  /** Fecha del cobro en formato YYYY-MM-DD. */
  fechaCobro: string;
  /** Socios de la familia del socio en el gimnasio, contándole a él. */
  sociosEnFamilia: number;
}

const TARIFA_EN_CENTIMOS: Record<Plan, number> = {
  basico: 2990,
  premium: 4990,
};

const DESCUENTO_MAXIMO = 30;
const EDAD_LIMITE_ESTUDIANTE = 26;
const SOCIOS_MINIMOS_FAMILIA = 3;
const AGOSTO = 8;

export function calcularCuota(socio: Socio, contexto: ContextoDeCobro): number {
  return aplicarDescuento(TARIFA_EN_CENTIMOS[socio.plan], porcentajeDeDescuento(socio, contexto));
}

function porcentajeDeDescuento(socio: Socio, contexto: ContextoDeCobro): number {
  const descuentoPersonal = Math.max(
    descuentoPorAntiguedad(socio, contexto.fechaCobro),
    descuentoPorEstudiante(socio, contexto.fechaCobro),
  );
  const total =
    descuentoPersonal +
    descuentoFamiliar(contexto.sociosEnFamilia) +
    descuentoDeVerano(socio.plan, contexto.fechaCobro);
  return Math.min(total, DESCUENTO_MAXIMO);
}

function descuentoPorAntiguedad(socio: Socio, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(socio.fechaAlta, fechaCobro);
  if (antiguedad >= 5) return 15;
  if (antiguedad >= 2) return 10;
  return 0;
}

function descuentoPorEstudiante(socio: Socio, fechaCobro: string): number {
  const edad = aniosCumplidos(socio.fechaNacimiento, fechaCobro);
  return socio.esEstudiante && edad < EDAD_LIMITE_ESTUDIANTE ? 20 : 0;
}

function descuentoFamiliar(sociosEnFamilia: number): number {
  return sociosEnFamilia >= SOCIOS_MINIMOS_FAMILIA ? 5 : 0;
}

function descuentoDeVerano(plan: Plan, fechaCobro: string): number {
  return plan === 'basico' && mesDe(fechaCobro) === AGOSTO ? 25 : 0;
}

/** Redondea al céntimo más cercano (medio céntimo, hacia arriba) con aritmética entera. */
function aplicarDescuento(tarifaEnCentimos: number, porcentaje: number): number {
  return Math.floor((tarifaEnCentimos * (100 - porcentaje) + 50) / 100);
}
