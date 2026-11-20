import { porcentajeDescuento, type CondicionesCobro } from './descuentos.ts';
import type { Plan, Socio } from './socio.ts';

const TARIFA_CENTIMOS: Record<Plan, number> = {
  basico: 2990,
  premium: 4990,
};

export function calcularCuota(socio: Socio, condiciones: CondicionesCobro): number {
  return aplicarDescuento(TARIFA_CENTIMOS[socio.plan], porcentajeDescuento(socio, condiciones));
}

// Aritmética entera: redondea al céntimo más cercano, el medio céntimo hacia arriba.
function aplicarDescuento(importeCentimos: number, porcentaje: number): number {
  const importeEnCentesimasDeCentimo = importeCentimos * (100 - porcentaje);
  return Math.floor((importeEnCentesimasDeCentimo + 50) / 100);
}
