export interface FechaDelCalendario {
  anio: number;
  mes: number;
  dia: number;
}

export function leerFecha(fechaIso: string): FechaDelCalendario {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return { anio, mes, dia };
}

function haLlegadoElAniversario(desde: FechaDelCalendario, hasta: FechaDelCalendario): boolean {
  if (hasta.mes !== desde.mes) {
    return hasta.mes > desde.mes;
  }
  return hasta.dia >= desde.dia;
}

export function aniosCumplidos(desdeIso: string, hastaIso: string): number {
  const desde = leerFecha(desdeIso);
  const hasta = leerFecha(hastaIso);
  const diferenciaDeAnios = hasta.anio - desde.anio;
  return haLlegadoElAniversario(desde, hasta) ? diferenciaDeAnios : diferenciaDeAnios - 1;
}
