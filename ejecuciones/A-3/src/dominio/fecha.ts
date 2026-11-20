// Fechas de calendario en formato ISO 'AAAA-MM-DD', sin hora ni zona horaria.

interface FechaCalendario {
  anio: number;
  mes: number;
  dia: number;
}

const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function leerFecha(iso: string): FechaCalendario {
  const partes = FORMATO_ISO.exec(iso);
  if (!partes) {
    throw new Error(`Fecha con formato no válido: ${iso}`);
  }
  return { anio: Number(partes[1]), mes: Number(partes[2]), dia: Number(partes[3]) };
}

export function aniosCumplidos(desde: string, hasta: string): number {
  const inicio = leerFecha(desde);
  const fin = leerFecha(hasta);
  const aniversarioAlcanzado =
    fin.mes > inicio.mes || (fin.mes === inicio.mes && fin.dia >= inicio.dia);
  return fin.anio - inicio.anio - (aniversarioAlcanzado ? 0 : 1);
}

export function mesDe(iso: string): number {
  return leerFecha(iso).mes;
}
