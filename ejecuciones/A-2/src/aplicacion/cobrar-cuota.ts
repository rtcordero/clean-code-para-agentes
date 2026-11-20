import { calcularCuota } from '../dominio/cuota.ts';
import { fechaDesdeDate } from '../dominio/fecha.ts';
import type { RepositorioSociosEnMemoria } from '../infraestructura/repositorio-socios.ts';
import type { Reloj } from '../infraestructura/reloj.ts';

export interface Recibo {
  socioId: string;
  importeCentimos: number;
  fecha: string;
}

export function cobrarCuota(
  repositorio: RepositorioSociosEnMemoria,
  reloj: Reloj,
  socioId: string,
): Recibo {
  const socio = repositorio.buscarPorId(socioId);
  if (!socio) {
    throw new Error(`No existe el socio ${socioId}`);
  }
  const hoy = reloj.hoy();
  const sociosEnSuFamilia = socio.familiaId ? repositorio.contarPorFamilia(socio.familiaId) : 1;
  return {
    socioId: socio.id,
    importeCentimos: calcularCuota(socio, { fechaCobro: fechaDesdeDate(hoy), sociosEnSuFamilia }),
    fecha: hoy.toISOString().slice(0, 10),
  };
}
