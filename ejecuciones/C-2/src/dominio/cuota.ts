import { descuentoTotal, type DatosDelCobro } from './descuentos.ts';
import type { Socio } from './socio.ts';

const TARIFA_BASICO_CENTIMOS = 2990;
const TARIFA_PREMIUM_CENTIMOS = 4990;
const CIEN_POR_CIEN = 100;

export function calcularCuota(socio: Socio): number {
  if (socio.plan === 'premium') {
    return TARIFA_PREMIUM_CENTIMOS;
  }
  return TARIFA_BASICO_CENTIMOS;
}

export function aplicarDescuento(importeCentimos: number, porcentaje: number): number {
  const importePorCien = importeCentimos * (CIEN_POR_CIEN - porcentaje);
  return Math.floor((importePorCien + CIEN_POR_CIEN / 2) / CIEN_POR_CIEN);
}

export function calcularCuotaConDescuentos(socio: Socio, datos: DatosDelCobro): number {
  return aplicarDescuento(calcularCuota(socio), descuentoTotal(socio, datos));
}
