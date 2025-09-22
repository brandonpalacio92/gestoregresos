export interface Presupuesto {
  id: string;
  mes: number; // 1-12
  año: number;
  montoTotal: number;
  montoGastado: number;
  montoDisponible: number;
  usuarioId: string;
  categorias: PresupuestoCategoria[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PresupuestoCategoria {
  categoriaId: string;
  montoAsignado: number;
  montoGastado: number;
  montoDisponible: number;
}

export interface PresupuestoMensual {
  mes: number;
  año: number;
  presupuesto_asignado: number;
  total_gastado: number;
  saldo_disponible: number;
  porcentaje_usado: number;
}
