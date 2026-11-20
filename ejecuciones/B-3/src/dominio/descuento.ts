import { aniosCumplidos, mesDe } from './fecha.ts';
import type { Socio } from './socio.ts';

export interface ContextoDeCobro {
  fechaCobro: string;
  sociosDeSuFamilia: number;
}

const DESCUENTO_MAXIMO = 30;
const AGOSTO = 8;

export function calcularPorcentajeDescuento(socio: Socio, contexto: ContextoDeCobro): number {
  const descuentoPersonal = Math.max(
    descuentoPorAntiguedad(socio, contexto.fechaCobro),
    descuentoDeEstudiante(socio, contexto.fechaCobro),
  );
  const descuentoTotal =
    descuentoPersonal +
    descuentoFamiliar(contexto.sociosDeSuFamilia) +
    descuentoDeVerano(socio, contexto.fechaCobro);
  return Math.min(descuentoTotal, DESCUENTO_MAXIMO);
}

function descuentoPorAntiguedad(socio: Socio, fechaCobro: string): number {
  const antiguedad = aniosCumplidos(socio.fechaAlta, fechaCobro);
  if (antiguedad >= 5) {
    return 15;
  }
  if (antiguedad >= 2) {
    return 10;
  }
  return 0;
}

function descuentoDeEstudiante(socio: Socio, fechaCobro: string): number {
  const edad = aniosCumplidos(socio.fechaNacimiento, fechaCobro);
  return socio.esEstudiante && edad < 26 ? 20 : 0;
}

function descuentoFamiliar(sociosDeSuFamilia: number): number {
  return sociosDeSuFamilia >= 3 ? 5 : 0;
}

function descuentoDeVerano(socio: Socio, fechaCobro: string): number {
  return socio.plan === 'basico' && mesDe(fechaCobro) === AGOSTO ? 25 : 0;
}
