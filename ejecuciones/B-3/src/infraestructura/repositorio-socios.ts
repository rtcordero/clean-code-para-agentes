import type { Socio } from '../dominio/socio.ts';

export class RepositorioSociosEnMemoria {
  private readonly socios: Socio[];

  constructor(socios: Socio[]) {
    this.socios = [...socios];
  }

  buscarPorId(id: string): Socio | undefined {
    return this.socios.find((socio) => socio.id === id);
  }

  contarMiembrosDeFamilia(familiaId: string): number {
    return this.socios.filter((socio) => socio.familiaId === familiaId).length;
  }

  todos(): Socio[] {
    return [...this.socios];
  }
}
