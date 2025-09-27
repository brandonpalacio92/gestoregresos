import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  constructor() { }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  get frontendUrl(): string {
    return environment.frontendUrl;
  }

  get isProduction(): boolean {
    return environment.production;
  }

  get logLevel(): string {
    return environment.logLevel;
  }

  get mockFallback(): boolean {
    return environment.mockFallback;
  }

  // Método para obtener URL completa de un endpoint
  getEndpointUrl(endpoint: string): string {
    const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl.slice(0, -1) : this.apiUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }

  // Método para obtener URL de autenticación
  get authUrl(): string {
    return this.getEndpointUrl('/auth');
  }

  // Método para obtener URL de egresos
  get egresosUrl(): string {
    return this.getEndpointUrl('/egresos');
  }

  // Método para obtener URL de categorías
  get categoriasUrl(): string {
    return this.getEndpointUrl('/egresos/tipos-egreso/con-categorias');
  }

  // Método para obtener URL de tipos de egreso
  get tiposEgresoUrl(): string {
    return this.getEndpointUrl('/egresos/tipos-egreso');
  }

  // Método para obtener URL de presupuesto
  get presupuestoUrl(): string {
    return this.getEndpointUrl('/presupuesto');
  }

  // Método para obtener URL de usuario
  get usuarioUrl(): string {
    return this.getEndpointUrl('/usuario');
  }
}
