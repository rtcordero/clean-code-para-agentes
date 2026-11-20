export interface FechaCalendario {
  anio: number;
  mes: number;
  dia: number;
}

export function leerFecha(fechaIso: string): FechaCalendario {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return { anio, mes, dia };
}

function haLlegadoElAniversario(desde: FechaCalendario, hasta: FechaCalendario): boolean {
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
