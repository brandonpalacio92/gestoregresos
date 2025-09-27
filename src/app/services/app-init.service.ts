import { Injectable } from '@angular/core';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(private themeService: ThemeService) {}

  /**
   * Inicializa la aplicación cargando configuraciones persistentes
   */
  async initializeApp(): Promise<void> {
    try {
      // Cargar tema personalizado al iniciar la app
      this.loadCustomTheme();
    } catch (error) {
    }
  }

  /**
   * Carga el tema personalizado desde localStorage
   */
  private loadCustomTheme(): void {
    // El ThemeService ya se encarga de cargar el tema en su constructor
    // pero podemos forzar una recarga aquí si es necesario
    const currentTheme = this.themeService.getCurrentTheme();
  }

  /**
   * Verifica si hay preferencias guardadas
   */
  hasStoredPreferences(): boolean {
    const colorTheme = localStorage.getItem('colorTheme');
    const preferencias = localStorage.getItem('preferenciasApp');
    
    return !!(colorTheme || preferencias);
  }

  /**
   * Obtiene las preferencias guardadas
   */
  getStoredPreferences(): any {
    const preferencias = localStorage.getItem('preferenciasApp');
    if (preferencias) {
      try {
        return JSON.parse(preferencias);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}
