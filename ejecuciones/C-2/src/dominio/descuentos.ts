import { anosCumplidos, fechaDesdeTexto, type Fecha } from './fecha.ts';
import type { Plan, Socio } from './socio.ts';

const SIN_DESCUENTO = 0;

const ANIOS_ANTIGUEDAD_MEDIA = 2;
const ANIOS_ANTIGUEDAD_ALTA = 5;
const DESCUENTO_ANTIGUEDAD_MEDIA = 10;
const DESCUENTO_ANTIGUEDAD_ALTA = 15;

const EDAD_LIMITE_ESTUDIANTE = 26;
const DESCUENTO_ESTUDIANTE = 20;

const SOCIOS_MINIMOS_FAMILIA = 3;
const DESCUENTO_FAMILIAR = 5;

const MES_AGOSTO = 8;
const DESCUENTO_VERANO_PLAN_BASICO = 25;

const DESCUENTO_TOTAL_MAXIMO = 30;

export interface DatosDelCobro {
  fechaCobro: Fecha;
  sociosEnFamilia: number;
}

export function descuentoPorAntiguedad(fechaAlta: Fecha, fechaCobro: Fecha): number {
  const antiguedad = anosCumplidos(fechaAlta, fechaCobro);
  if (antiguedad >= ANIOS_ANTIGUEDAD_ALTA) {
    return DESCUENTO_ANTIGUEDAD_ALTA;
  }
  if (antiguedad >= ANIOS_ANTIGUEDAD_MEDIA) {
    return DESCUENTO_ANTIGUEDAD_MEDIA;
  }
  return SIN_DESCUENTO;
}

export function descuentoPorEstudiante(socio: Socio, fechaCobro: Fecha): number {
  if (!socio.esEstudiante) {
    return SIN_DESCUENTO;
  }
  const edad = anosCumplidos(fechaDeNacimiento(socio), fechaCobro);
  return edad < EDAD_LIMITE_ESTUDIANTE ? DESCUENTO_ESTUDIANTE : SIN_DESCUENTO;
}

export function descuentoFamiliar(sociosEnFamilia: number): number {
  return sociosEnFamilia >= SOCIOS_MINIMOS_FAMILIA ? DESCUENTO_FAMILIAR : SIN_DESCUENTO;
}

export function descuentoDeVerano(plan: Plan, fechaCobro: Fecha): number {
  const esAgosto = fechaCobro.mes === MES_AGOSTO;
  return plan === 'basico' && esAgosto ? DESCUENTO_VERANO_PLAN_BASICO : SIN_DESCUENTO;
}

export function descuentoNoAcumulable(socio: Socio, fechaCobro: Fecha): number {
  return Math.max(
    descuentoPorAntiguedad(fechaDeAlta(socio), fechaCobro),
    descuentoPorEstudiante(socio, fechaCobro),
  );
}

export function limitarAlDescuentoMaximo(porcentaje: number): number {
  return Math.min(porcentaje, DESCUENTO_TOTAL_MAXIMO);
}

export function descuentoTotal(socio: Socio, datos: DatosDelCobro): number {
  const sumaDeDescuentos =
    descuentoNoAcumulable(socio, datos.fechaCobro) +
    descuentoFamiliar(datos.sociosEnFamilia) +
    descuentoDeVerano(socio.plan, datos.fechaCobro);
  return limitarAlDescuentoMaximo(sumaDeDescuentos);
}

function fechaDeAlta(socio: Socio): Fecha {
  return fechaDesdeTexto(socio.fechaAlta);
}

function fechaDeNacimiento(socio: Socio): Fecha {
  return fechaDesdeTexto(socio.fechaNacimiento);
}
