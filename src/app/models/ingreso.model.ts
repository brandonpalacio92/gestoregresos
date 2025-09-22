export interface Ingreso {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  fuente: string; // Salario, Freelance, Inversiones, etc.
  esPeriodico: boolean;
  frecuencia?: 'mensual' | 'semanal' | 'anual';
  usuarioId: string;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngresoPeriodico extends Ingreso {
  esPeriodico: true;
  frecuencia: 'mensual' | 'semanal' | 'anual';
  proximaFecha: Date;
}

export interface IngresoOcasional extends Ingreso {
  esPeriodico: false;
}
