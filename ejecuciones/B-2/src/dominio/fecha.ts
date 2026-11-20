// Las fechas del dominio son fechas de calendario en formato ISO (AAAA-MM-DD).

interface FechaCalendario {
  anio: number;
  mes: number;
  dia: number;
}

function leerFecha(fechaIso: string): FechaCalendario {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return { anio, mes, dia };
}

export function aniosCumplidos(desde: string, hasta: string): number {
  const inicio = leerFecha(desde);
  const fin = leerFecha(hasta);
  const haLlegadoElAniversario =
    fin.mes > inicio.mes || (fin.mes === inicio.mes && fin.dia >= inicio.dia);
  const aniosNaturales = fin.anio - inicio.anio;
  return haLlegadoElAniversario ? aniosNaturales : aniosNaturales - 1;
}

export function mesDe(fecha: string): number {
  return leerFecha(fecha).mes;
}
