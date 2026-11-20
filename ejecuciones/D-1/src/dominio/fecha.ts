export interface FechaDeCalendario {
  anio: number;
  mes: number;
  dia: number;
}

export function leerFechaIso(fechaIso: string): FechaDeCalendario {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return { anio, mes, dia };
}

function haLlegadoElAniversario(desde: FechaDeCalendario, hasta: FechaDeCalendario): boolean {
  if (hasta.mes !== desde.mes) {
    return hasta.mes > desde.mes;
  }
  return hasta.dia >= desde.dia;
}

export function aniosCumplidos(fechaIsoInicio: string, fechaIsoFin: string): number {
  const inicio = leerFechaIso(fechaIsoInicio);
  const fin = leerFechaIso(fechaIsoFin);
  const diferenciaDeAnios = fin.anio - inicio.anio;
  return haLlegadoElAniversario(inicio, fin) ? diferenciaDeAnios : diferenciaDeAnios - 1;
}

export function mesDe(fechaIso: string): number {
  return leerFechaIso(fechaIso).mes;
}
