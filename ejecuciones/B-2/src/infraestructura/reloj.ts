export interface Reloj {
  hoy(): Date;
}

export class RelojDelSistema implements Reloj {
  hoy(): Date {
    return new Date();
  }
}

export class RelojFijo implements Reloj {
  private readonly fecha: Date;

  constructor(fecha: Date) {
    this.fecha = fecha;
  }

  hoy(): Date {
    return new Date(this.fecha);
  }
}
