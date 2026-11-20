import { calcularCuotaConDescuentos } from '../dominio/cuota.ts';
import { contarMiembrosDeLaFamilia } from '../dominio/descuentos.ts';
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
  const fechaCobro = reloj.hoy().toISOString().slice(0, LONGITUD_FECHA_ISO);
  const miembrosDeLaFamilia = contarMiembrosDeLaFamilia(socio, repositorio.todos());
  return {
    socioId: socio.id,
    importeCentimos: calcularCuotaConDescuentos(socio, { fechaCobro, miembrosDeLaFamilia }),
    fecha: fechaCobro,
  };
}
