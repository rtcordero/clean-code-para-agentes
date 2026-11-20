import type { Socio } from './socio.ts';
import type { DatosDelCobro } from './descuentos.ts';
import { porcentajeDeDescuento } from './descuentos.ts';

const TARIFA_BASICO_CENTIMOS = 2990;
const TARIFA_PREMIUM_CENTIMOS = 4990;
const CIEN_POR_CIEN = 100;

export function calcularCuota(socio: Socio): number {
  if (socio.plan === 'premium') {
    return TARIFA_PREMIUM_CENTIMOS;
  }
  return TARIFA_BASICO_CENTIMOS;
}

export function aplicarDescuento(tarifaCentimos: number, porcentaje: number): number {
  return Math.round((tarifaCentimos * (CIEN_POR_CIEN - porcentaje)) / CIEN_POR_CIEN);
}

export function calcularCuotaConDescuentos(socio: Socio, cobro: DatosDelCobro): number {
  return aplicarDescuento(calcularCuota(socio), porcentajeDeDescuento(socio, cobro));
}
