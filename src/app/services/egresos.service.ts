import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Egreso, EgresoPeriodico, EgresoOcasional } from '../models/egreso.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EgresosService {

  private baseUrl = `${environment.apiUrl}/egresos`;

  constructor(private http: HttpClient) { }

  // Obtener egresos del usuario con filtros opcionales
  getEgresos(usuarioId: string, filtros?: {estado?: string, tipoEgresoId?: string, periodo?: string, mes?: number, año?: number}): Observable<Egreso[]> {
    let url = `${this.baseUrl}?usuarioId=${usuarioId}`;
    if (filtros) {
      if (filtros.estado && filtros.estado !== 'todos') {
        url += `&estado=${filtros.estado}`;
      }
      if (filtros.tipoEgresoId && filtros.tipoEgresoId !== 'todos') {
        url += `&tipoEgresoId=${filtros.tipoEgresoId}`;
      }
      if (filtros.periodo && filtros.periodo !== 'todos') {
        url += `&periodo=${filtros.periodo}`;
      }
      // Agregar parámetros de mes y año para filtro personalizado
      if (filtros.mes) {
        url += `&mes=${filtros.mes}`;
      }
      if (filtros.año) {
        url += `&año=${filtros.año}`;
      }
    }
    return this.http.get<Egreso[]>(url);
  }

  // Obtener egresos por mes
  getEgresosPorMes(usuarioId: string, mes: number, año: number): Observable<Egreso[]> {
    return this.http.get<Egreso[]>(`${this.baseUrl}/mes?usuarioId=${usuarioId}&mes=${mes}&año=${año}`);
  }

  // Obtener estadísticas por categoría del mes
  getEstadisticasMes(usuarioId: string, mes: number, año: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/estadisticas-mes?usuarioId=${usuarioId}&mes=${mes}&año=${año}`);
  }

  // Obtener egresos periódicos
  getEgresosPeriodicos(usuarioId: string): Observable<EgresoPeriodico[]> {
    return this.http.get<EgresoPeriodico[]>(`${this.baseUrl}/periodicos?usuarioId=${usuarioId}`);
  }

  // Crear nuevo egreso
  crearEgreso(egreso: Omit<Egreso, 'id' | 'createdAt' | 'updatedAt'>): Observable<Egreso> {
    return this.http.post<Egreso>(`${this.baseUrl}`, egreso);
  }

  // Actualizar egreso
  actualizarEgreso(id: string, egreso: Partial<Egreso>): Observable<Egreso> {
    return this.http.put<Egreso>(`${this.baseUrl}/${id}`, egreso);
  }

  // Eliminar egreso
  eliminarEgreso(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  // Marcar egreso como pagado
  marcarComoPagado(id: string): Observable<Egreso> {
    return this.http.put<Egreso>(`${this.baseUrl}/${id}/pagar`, {});
  }

  // Obtener reporte anual
  getReporteAnual(usuarioId: string, año: number): Observable<Egreso[]> {
    return this.http.get<Egreso[]>(`${this.baseUrl}/reporte-anual?usuarioId=${usuarioId}&año=${año}`);
  }
}

