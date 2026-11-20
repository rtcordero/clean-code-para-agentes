import { porcentajeDeDescuentoTotal, type CondicionesDelCobro } from './descuentos.ts';
import type { Socio } from './socio.ts';

const TARIFA_PLAN_BASICO_CENTIMOS = 2990;
const TARIFA_PLAN_PREMIUM_CENTIMOS = 4990;
const CIEN_POR_CIEN = 100;

export function calcularCuota(socio: Socio): number {
  if (socio.plan === 'premium') {
    return TARIFA_PLAN_PREMIUM_CENTIMOS;
  }
  return TARIFA_PLAN_BASICO_CENTIMOS;
}

export function aplicarDescuento(tarifaCentimos: number, porcentajeDescuento: number): number {
  const centimosSinRedondear = (tarifaCentimos * (CIEN_POR_CIEN - porcentajeDescuento)) / CIEN_POR_CIEN;
  return Math.round(centimosSinRedondear);
}

export function calcularCuotaConDescuentos(socio: Socio, condiciones: CondicionesDelCobro): number {
  return aplicarDescuento(calcularCuota(socio), porcentajeDeDescuentoTotal(socio, condiciones));
}
