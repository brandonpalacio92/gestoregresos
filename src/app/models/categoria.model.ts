export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  activa: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoriaConEgresos extends Categoria {
  egresos: number;
  montoTotal: number;
  montoGastado: number;
  montoAsignado: number;
}
