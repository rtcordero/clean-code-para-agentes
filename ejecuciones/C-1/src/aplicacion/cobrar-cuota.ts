import { calcularCuotaConDescuentos } from '../dominio/cuota.ts';
import type { Socio } from '../dominio/socio.ts';
import type { RepositorioSociosEnMemoria } from '../infraestructura/repositorio-socios.ts';
import type { Reloj } from '../infraestructura/reloj.ts';

export interface Recibo {
  socioId: string;
  importeCentimos: number;
  fecha: string;
}

const LONGITUD_FECHA_ISO = 10;

function fechaDeHoy(reloj: Reloj): string {
  return reloj.hoy().toISOString().slice(0, LONGITUD_FECHA_ISO);
}

function contarSociosEnFamilia(repositorio: RepositorioSociosEnMemoria, socio: Socio): number {
  if (socio.familiaId === undefined) {
    return 1;
  }
  return repositorio.todos().filter((otro) => otro.familiaId === socio.familiaId).length;
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
  const fechaCobro = fechaDeHoy(reloj);
  const sociosEnFamilia = contarSociosEnFamilia(repositorio, socio);
  return {
    socioId: socio.id,
    importeCentimos: calcularCuotaConDescuentos(socio, { fechaCobro, sociosEnFamilia }),
    fecha: fechaCobro,
  };
}
