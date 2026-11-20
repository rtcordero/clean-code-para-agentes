export interface Fecha {
  anio: number;
  mes: number;
  dia: number;
}

export function fechaDesdeTexto(textoIso: string): Fecha {
  const [anio, mes, dia] = textoIso.split('-').map(Number);
  return { anio, mes, dia };
}

export function anosCumplidos(desde: Fecha, hasta: Fecha): number {
  const diferenciaDeAnios = hasta.anio - desde.anio;
  const aunNoEsElAniversario =
    hasta.mes < desde.mes || (hasta.mes === desde.mes && hasta.dia < desde.dia);
  return aunNoEsElAniversario ? diferenciaDeAnios - 1 : diferenciaDeAnios;
}
