export interface FechaCalendario {
  anio: number;
  mes: number;
  dia: number;
}

export const AGOSTO = 8;

export function fechaDesdeIso(texto: string): FechaCalendario {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!coincidencia) {
    throw new Error(`Fecha con formato no válido: ${texto}`);
  }
  const [, anio, mes, dia] = coincidencia;
  return { anio: Number(anio), mes: Number(mes), dia: Number(dia) };
}

// Usa UTC para coincidir con la fecha que se imprime en el recibo (toISOString).
export function fechaDesdeDate(fecha: Date): FechaCalendario {
  return {
    anio: fecha.getUTCFullYear(),
    mes: fecha.getUTCMonth() + 1,
    dia: fecha.getUTCDate(),
  };
}

export function aniosCumplidos(desde: FechaCalendario, hasta: FechaCalendario): number {
  const anios = hasta.anio - desde.anio;
  const aunNoEsElAniversario =
    hasta.mes < desde.mes || (hasta.mes === desde.mes && hasta.dia < desde.dia);
  return aunNoEsElAniversario ? anios - 1 : anios;
}
