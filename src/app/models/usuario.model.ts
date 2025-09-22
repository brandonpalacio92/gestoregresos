export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  porcentajeResponsabilidad: number; // Porcentaje de responsabilidad en gastos compartidos
  fechaRegistro: Date;
  activo: boolean;
}

export interface PerfilUsuario {
  usuario: Usuario;
  preferencias: {
    moneda: string;
    idioma: string;
    notificaciones: boolean;
  };
}
