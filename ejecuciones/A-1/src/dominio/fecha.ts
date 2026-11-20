export interface FechaCalendario {
  año: number;
  mes: number;
  dia: number;
}

const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function fechaDesdeIso(iso: string): FechaCalendario {
  const partes = FORMATO_ISO.exec(iso);
  if (!partes) {
    throw new Error(`Fecha con formato no válido: ${iso}`);
  }
  return { año: Number(partes[1]), mes: Number(partes[2]), dia: Number(partes[3]) };
}

export function fechaUtcDe(instante: Date): FechaCalendario {
  return {
    año: instante.getUTCFullYear(),
    mes: instante.getUTCMonth() + 1,
    dia: instante.getUTCDate(),
  };
}

export function añosCumplidos(desde: FechaCalendario, hasta: FechaCalendario): number {
  const años = hasta.año - desde.año;
  const aniversarioAlcanzado =
    hasta.mes > desde.mes || (hasta.mes === desde.mes && hasta.dia >= desde.dia);
  return aniversarioAlcanzado ? años : años - 1;
}
