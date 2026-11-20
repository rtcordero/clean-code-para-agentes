import { descuentoTotal } from './descuentos.ts';
import type { ContextoDeCobro } from './descuentos.ts';
import type { Socio } from './socio.ts';

const TARIFA_PREMIUM_CENTIMOS = 4990;
const TARIFA_BASICO_CENTIMOS = 2990;
const CIEN_POR_CIEN = 100;
const MEDIO_CENTIMO_ESCALADO = CIEN_POR_CIEN / 2;

export function calcularCuota(socio: Socio): number {
  if (socio.plan === 'premium') {
    return TARIFA_PREMIUM_CENTIMOS;
  }
  return TARIFA_BASICO_CENTIMOS;
}

export function aplicarDescuento(tarifaCentimos: number, porcentajeDescuento: number): number {
  const importeEscalado = tarifaCentimos * (CIEN_POR_CIEN - porcentajeDescuento);
  return Math.floor((importeEscalado + MEDIO_CENTIMO_ESCALADO) / CIEN_POR_CIEN);
}

export function calcularCuotaConDescuentos(socio: Socio, contexto: ContextoDeCobro): number {
  return aplicarDescuento(calcularCuota(socio), descuentoTotal(socio, contexto));
}
