import { calcularCuotaConDescuentos } from '../dominio/cuota.ts';
import { fechaDesdeTexto } from '../dominio/fecha.ts';
import type { Socio } from '../dominio/socio.ts';
import type { RepositorioSociosEnMemoria } from '../infraestructura/repositorio-socios.ts';
import type { Reloj } from '../infraestructura/reloj.ts';

const LONGITUD_FECHA_ISO = 10;

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
  const fecha = reloj.hoy().toISOString().slice(0, LONGITUD_FECHA_ISO);
  const importeCentimos = calcularCuotaConDescuentos(socio, {
    fechaCobro: fechaDesdeTexto(fecha),
    sociosEnFamilia: contarSociosDeSuFamilia(repositorio, socio),
  });
  return { socioId: socio.id, importeCentimos, fecha };
}

function contarSociosDeSuFamilia(repositorio: RepositorioSociosEnMemoria, socio: Socio): number {
  if (socio.familiaId === undefined) {
    return 1;
  }
  return repositorio.todos().filter((otro) => otro.familiaId === socio.familiaId).length;
}
