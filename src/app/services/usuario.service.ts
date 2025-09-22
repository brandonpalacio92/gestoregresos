import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { Usuario, PerfilUsuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  // Obtener usuario actual
  getUsuarioActual(): Observable<Usuario | null> {
    return this.http.get<Usuario>(`${this.baseUrl}/profile`);
  }

  // Obtener perfil completo del usuario
  getPerfilUsuario(usuarioId: string): Observable<PerfilUsuario | null> {
    return this.http.get<PerfilUsuario>(`${this.baseUrl}/${usuarioId}/profile`);
  }

  // Crear nuevo usuario
  crearUsuario(usuario: Omit<Usuario, 'id' | 'fechaRegistro'>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}`, usuario);
  }

  // Actualizar usuario
  actualizarUsuario(id: string, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  // Actualizar porcentaje de responsabilidad
  actualizarPorcentajeResponsabilidad(id: string, porcentaje: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}/responsabilidad`, { porcentaje });
  }

  // Actualizar preferencias del usuario
  actualizarPreferencias(usuarioId: string, preferencias: PerfilUsuario['preferencias']): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(`${this.baseUrl}/${usuarioId}/preferencias`, { preferencias });
  }

  // Verificar si el usuario está autenticado
  isAutenticado(): boolean {
    // TODO: Implementar verificación de autenticación
    return false;
  }

  // Cerrar sesión
  cerrarSesion(): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/logout`, {});
  }

}
