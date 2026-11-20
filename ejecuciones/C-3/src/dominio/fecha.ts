const DESFASE_MES_DEL_ANIO = 1;

export function aniosCumplidos(desde: Date, hasta: Date): number {
  const aniosDeDiferencia = hasta.getUTCFullYear() - desde.getUTCFullYear();
  const mismoMes = hasta.getUTCMonth() === desde.getUTCMonth();
  const yaPasoElAniversario =
    hasta.getUTCMonth() > desde.getUTCMonth() || (mismoMes && hasta.getUTCDate() >= desde.getUTCDate());
  return yaPasoElAniversario ? aniosDeDiferencia : aniosDeDiferencia - 1;
}

export function mesDelAnio(fecha: Date): number {
  return fecha.getUTCMonth() + DESFASE_MES_DEL_ANIO;
}
