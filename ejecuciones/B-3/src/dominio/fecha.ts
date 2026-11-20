interface FechaCalendario {
  anio: number;
  mes: number;
  dia: number;
}

function leerFechaIso(fechaIso: string): FechaCalendario {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return { anio, mes, dia };
}

export function aniosCumplidos(desdeIso: string, hastaIso: string): number {
  const desde = leerFechaIso(desdeIso);
  const hasta = leerFechaIso(hastaIso);
  const aunNoEsElAniversario =
    hasta.mes < desde.mes || (hasta.mes === desde.mes && hasta.dia < desde.dia);
  return hasta.anio - desde.anio - (aunNoEsElAniversario ? 1 : 0);
}

export function mesDe(fechaIso: string): number {
  return leerFechaIso(fechaIso).mes;
}
