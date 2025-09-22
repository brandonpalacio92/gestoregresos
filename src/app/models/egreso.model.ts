export interface Egreso {
  id: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoriaId: string;
  esPeriodico: boolean;
  frecuencia?: 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  fechaInicio?: Date;
  fechaFin?: Date;
  usuarioId: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'parcializado';
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Campos de categoría que vienen del JOIN
  categoria_nombre?: string;
}

export interface EgresoPeriodico extends Egreso {
  esPeriodico: true;
  frecuencia: 'mensual' | 'semanal' | 'anual';
  fechaInicio: Date;
  fechaFin?: Date;
  proximoVencimiento: Date;
}

export interface EgresoOcasional extends Egreso {
  esPeriodico: false;
}
