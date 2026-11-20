import { calcularPorcentajeDescuento, type ContextoDeCobro } from './descuento.ts';
import type { Plan, Socio } from './socio.ts';

const TARIFA_EN_CENTIMOS: Record<Plan, number> = {
  basico: 2990,
  premium: 4990,
};

export function calcularCuota(socio: Socio, contexto: ContextoDeCobro): number {
  const tarifa = TARIFA_EN_CENTIMOS[socio.plan];
  const porcentajeDescuento = calcularPorcentajeDescuento(socio, contexto);
  return redondearAlCentimo((tarifa * (100 - porcentajeDescuento)) / 100);
}

function redondearAlCentimo(centimos: number): number {
  return Math.floor(centimos + 0.5);
}
