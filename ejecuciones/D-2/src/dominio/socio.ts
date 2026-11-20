export type Plan = 'basico' | 'premium';

export interface Socio {
  id: string;
  nombre: string;
  plan: Plan;
  fechaAlta: string;
  fechaNacimiento: string;
  esEstudiante: boolean;
  familiaId?: string;
}
