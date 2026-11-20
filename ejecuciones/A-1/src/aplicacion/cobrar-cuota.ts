import { calcularCuota } from '../dominio/cuota.ts';
import { fechaUtcDe } from '../dominio/fecha.ts';
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
  const instanteDelCobro = reloj.hoy();
  const importeCentimos = calcularCuota(socio, {
    fecha: fechaUtcDe(instanteDelCobro),
    sociosDeSuFamilia: contarSociosDeSuFamilia(repositorio, socio),
  });
  return {
    socioId: socio.id,
    importeCentimos,
    fecha: instanteDelCobro.toISOString().slice(0, 10),
  };
}

function contarSociosDeSuFamilia(repositorio: RepositorioSociosEnMemoria, socio: Socio): number {
  return socio.familiaId ? repositorio.contarDeLaFamilia(socio.familiaId) : 1;
}
