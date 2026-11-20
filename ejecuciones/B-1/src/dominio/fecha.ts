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
  const aniversarioAlcanzado =
    fin.mes > inicio.mes || (fin.mes === inicio.mes && fin.dia >= inicio.dia);
  const aniosNaturales = fin.anio - inicio.anio;
  return aniversarioAlcanzado ? aniosNaturales : aniosNaturales - 1;
}

export function mesDe(fechaIso: string): number {
  return leerFecha(fechaIso).mes;
}
