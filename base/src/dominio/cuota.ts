import type { Socio } from './socio.ts';

export function calcularCuota(socio: Socio): number {
  if (socio.plan === 'premium') {
    return 4990;
  }
  return 2990;
}
