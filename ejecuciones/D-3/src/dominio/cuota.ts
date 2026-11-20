import type { Plan, Socio } from './socio.ts';
import { descuentoTotal, type CondicionesDelCobro } from './descuentos.ts';

const TARIFA_BASICO_CENTIMOS = 2990;
const TARIFA_PREMIUM_CENTIMOS = 4990;
const CIEN_POR_CIEN = 100;

const TARIFA_POR_PLAN: Record<Plan, number> = {
  basico: TARIFA_BASICO_CENTIMOS,
  premium: TARIFA_PREMIUM_CENTIMOS,
};

export function tarifaDelPlan(plan: Plan): number {
  return TARIFA_POR_PLAN[plan];
}

export function aplicarDescuento(tarifaCentimos: number, porcentajeDescuento: number): number {
  const porcentajeAPagar = CIEN_POR_CIEN - porcentajeDescuento;
  return Math.round((tarifaCentimos * porcentajeAPagar) / CIEN_POR_CIEN);
}

export function calcularCuota(socio: Socio, condiciones: CondicionesDelCobro): number {
  return aplicarDescuento(tarifaDelPlan(socio.plan), descuentoTotal(socio, condiciones));
}
