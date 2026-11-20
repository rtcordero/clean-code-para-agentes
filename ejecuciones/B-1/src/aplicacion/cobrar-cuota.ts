import { calcularCuota } from '../dominio/cuota.ts';
import type { Socio } from '../dominio/socio.ts';
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
  const fechaCobro = reloj.hoy().toISOString().slice(0, 10);
  const sociosEnFamilia = contarSociosEnFamilia(repositorio, socio);
  return {
    socioId: socio.id,
    importeCentimos: calcularCuota(socio, { fechaCobro, sociosEnFamilia }),
    fecha: fechaCobro,
  };
}

function contarSociosEnFamilia(repositorio: RepositorioSociosEnMemoria, socio: Socio): number {
  if (socio.familiaId === undefined) {
    return 1;
  }
  return repositorio.buscarPorFamilia(socio.familiaId).length;
}
