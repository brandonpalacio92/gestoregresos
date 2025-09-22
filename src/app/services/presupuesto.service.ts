import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Presupuesto, PresupuestoMensual } from '../models/presupuesto.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {

  private baseUrl = `${environment.apiUrl}/api/egresos`;

  constructor(private http: HttpClient) { }

  // Obtener presupuesto del mes actual
  getPresupuestoActual(usuarioId: string): Observable<Presupuesto | null> {
    const mesActual = new Date().getMonth() + 1;
    const añoActual = new Date().getFullYear();
    return this.getPresupuestoPorMes(usuarioId, mesActual, añoActual);
  }

  // Obtener presupuesto por mes específico
  getPresupuestoPorMes(usuarioId: string, mes: number, año: number): Observable<Presupuesto | null> {
    return this.http.get<Presupuesto>(`${this.baseUrl}/mensual?usuarioId=${usuarioId}&mes=${mes}&año=${año}`);
  }

  // Crear presupuesto para un mes
  crearPresupuesto(presupuesto: Omit<Presupuesto, 'id' | 'createdAt' | 'updatedAt'>): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${this.baseUrl}`, presupuesto);
  }

  // Actualizar presupuesto
  actualizarPresupuesto(id: string, presupuesto: Partial<Presupuesto>): Observable<Presupuesto> {
    return this.http.put<Presupuesto>(`${this.baseUrl}/${id}`, presupuesto);
  }

  // Obtener resumen mensual
  getResumenMensual(usuarioId: string, mes: number, año: number): Observable<PresupuestoMensual | null> {
    return this.http.get<{success: boolean, data: PresupuestoMensual}>(`${this.baseUrl}/presupuesto/mensual?usuarioId=${usuarioId}&mes=${mes}&año=${año}`)
      .pipe(
        map((response: {success: boolean, data: PresupuestoMensual}) => response.success ? response.data : null)
      );
  }

  // Calcular monto disponible
  calcularMontoDisponible(presupuesto: Presupuesto): number {
    return presupuesto.montoTotal - presupuesto.montoGastado;
  }

  // Verificar si se excedió el presupuesto
  verificarExcesoPresupuesto(presupuesto: Presupuesto): boolean {
    return presupuesto.montoGastado > presupuesto.montoTotal;
  }

}