import { Categoria } from './categoria.model';

export interface TipoEgreso {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TipoEgresoConCategorias extends TipoEgreso {
  categorias: Categoria[];
}
