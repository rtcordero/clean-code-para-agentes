export interface FechaCivil {
  anio: number;
  mes: number;
  dia: number;
}

export function leerFecha(fechaIso: string): FechaCivil {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  return { anio, mes, dia };
}

function yaHaPasadoElAniversario(inicio: FechaCivil, fin: FechaCivil): boolean {
  if (fin.mes !== inicio.mes) {
    return fin.mes > inicio.mes;
  }
  return fin.dia >= inicio.dia;
}

export function aniosCumplidos(desde: string, hasta: string): number {
  const inicio = leerFecha(desde);
  const fin = leerFecha(hasta);
  const diferenciaDeAnios = fin.anio - inicio.anio;
  return yaHaPasadoElAniversario(inicio, fin) ? diferenciaDeAnios : diferenciaDeAnios - 1;
}

export function mesDe(fechaIso: string): number {
  return leerFecha(fechaIso).mes;
}
