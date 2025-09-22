import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria, CategoriaConEgresos } from '../models/categoria.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private apiUrl = 'http://localhost:3000/api/egresos/tipos-egreso/con-categorias';

  constructor(private http: HttpClient) { }

  // Obtener todas las categorías
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Obtener categoría por ID
  getCategoriaPorId(id: string): Observable<Categoria | null> {
    return this.http.get<Categoria | null>(`${this.apiUrl}/${id}`);
  }

  // Obtener categorías por usuario
  getCategoriasPorUsuario(usuarioId: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  // Obtener categorías activas
  getCategoriasActivas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/activas`);
  }

  // Obtener categorías con estadísticas de egresos
  getCategoriasConEgresos(usuarioId: string, mes?: number, anio?: number): Observable<CategoriaConEgresos[]> {
    const params = new URLSearchParams();
    if (usuarioId) params.append('usuarioId', usuarioId);
    if (mes) params.append('mes', mes.toString());
    if (anio) params.append('anio', anio.toString());
    
    return this.http.get<CategoriaConEgresos[]>(`${this.apiUrl}/con-egresos?${params.toString()}`);
  }

  // Crear nueva categoría
  crearCategoria(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  // Actualizar categoría
  actualizarCategoria(id: string, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }

  // Eliminar categoría
  eliminarCategoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
