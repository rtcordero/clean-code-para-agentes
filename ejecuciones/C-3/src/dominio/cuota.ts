import type { Plan, Socio } from './socio.ts';
import { porcentajeDeDescuento, type CondicionesDelCobro } from './descuentos.ts';

const TARIFA_BASICO_CENTIMOS = 2990;
const TARIFA_PREMIUM_CENTIMOS = 4990;
const PORCENTAJE_COMPLETO = 100;
const MEDIO_CENTIMO_EN_CENTESIMAS = PORCENTAJE_COMPLETO / 2;

const TARIFA_POR_PLAN: Record<Plan, number> = {
  basico: TARIFA_BASICO_CENTIMOS,
  premium: TARIFA_PREMIUM_CENTIMOS,
};

export function calcularCuota(socio: Socio): number {
  return TARIFA_POR_PLAN[socio.plan];
}

export function calcularCuotaConDescuentos(socio: Socio, condiciones: CondicionesDelCobro): number {
  return aplicarDescuento(calcularCuota(socio), porcentajeDeDescuento(socio, condiciones));
}

export function aplicarDescuento(importeCentimos: number, porcentaje: number): number {
  const importeEnCentesimasDeCentimo = importeCentimos * (PORCENTAJE_COMPLETO - porcentaje);
  return Math.floor((importeEnCentesimasDeCentimo + MEDIO_CENTIMO_EN_CENTESIMAS) / PORCENTAJE_COMPLETO);
}
