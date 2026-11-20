import { calcularCuotaConDescuentos } from '../dominio/cuota.ts';
import type { Socio } from '../dominio/socio.ts';
import type { RepositorioSociosEnMemoria } from '../infraestructura/repositorio-socios.ts';
import type { Reloj } from '../infraestructura/reloj.ts';

const LONGITUD_FECHA_ISO = 'AAAA-MM-DD'.length;
const SOCIO_SIN_FAMILIA = 1;

export interface Recibo {
  socioId: string;
  importeCentimos: number;
  fecha: string;
}

function sociosEnLaFamiliaDe(socio: Socio, repositorio: RepositorioSociosEnMemoria): number {
  if (socio.familiaId === undefined) {
    return SOCIO_SIN_FAMILIA;
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
  const fechaCobro = reloj.hoy().toISOString().slice(0, LONGITUD_FECHA_ISO);
  const sociosEnLaFamilia = sociosEnLaFamiliaDe(socio, repositorio);
  return {
    socioId: socio.id,
    importeCentimos: calcularCuotaConDescuentos(socio, { fechaCobro, sociosEnLaFamilia }),
    fecha: fechaCobro,
  };
}
