import { aniosCumplidos, mesDe } from './fecha.ts';
import type { Plan, Socio } from './socio.ts';

const TARIFA_CENTIMOS: Record<Plan, number> = {
  basico: 2990,
  premium: 4990,
};

const DESCUENTO_MAXIMO = 30;

const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;

const SOCIOS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIA = 5;

const AGOSTO = 8;
const DESCUENTO_VERANO_BASICO = 25;

export interface ContextoCobro {
  /** Fecha del cobro, 'AAAA-MM-DD'. */
  fechaCobro: string;
  /** Socios del gimnasio en la familia del socio, contándole a él (1 si no tiene familia). */
  sociosEnFamilia: number;
}

export function calcularCuota(socio: Socio, contexto: ContextoCobro): number {
  return aplicarDescuento(TARIFA_CENTIMOS[socio.plan], porcentajeDescuento(socio, contexto));
}

function porcentajeDescuento(socio: Socio, contexto: ContextoCobro): number {
  const descuentoPersonal = Math.max(
    descuentoAntiguedad(socio, contexto.fechaCobro),
    descuentoEstudiante(socio, contexto.fechaCobro),
  );
  const total =
    descuentoPersonal +
    descuentoFamilia(contexto.sociosEnFamilia) +
    descuentoVerano(socio, contexto.fechaCobro);
  return Math.min(total, DESCUENTO_MAXIMO);
}

function descuentoAntiguedad(socio: Socio, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(socio.fechaAlta, fechaCobro);
  if (antiguedad >= 5) return 15;
  if (antiguedad >= 2) return 10;
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
  return socio.plan === 'basico' && mesDe(fechaCobro) === AGOSTO ? DESCUENTO_VERANO_BASICO : 0;
}

// Aritmética entera para evitar errores de coma flotante; el +50 redondea
// el medio céntimo hacia arriba (los importes nunca son negativos).
function aplicarDescuento(tarifaCentimos: number, porcentaje: number): number {
  return Math.floor((tarifaCentimos * (100 - porcentaje) + 50) / 100);
}
