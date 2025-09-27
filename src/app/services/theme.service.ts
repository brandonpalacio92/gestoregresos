import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ColorTheme {
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ColorTheme>({
    colorPrimario: '#3880ff',
    colorSecundario: '#3dc2ff',
    colorAcento: '#5260ff'
  });

  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadThemeFromStorage();
  }

  private loadThemeFromStorage() {
    // Primero intentar cargar desde colorTheme
    let savedTheme = localStorage.getItem('colorTheme');
    
    // Si no existe, intentar cargar desde preferenciasApp
    if (!savedTheme) {
      const preferencias = localStorage.getItem('preferenciasApp');
      if (preferencias) {
        try {
          const prefs = JSON.parse(preferencias);
          if (prefs.colorPrimario && prefs.colorSecundario && prefs.colorAcento) {
            savedTheme = JSON.stringify({
              colorPrimario: prefs.colorPrimario,
              colorSecundario: prefs.colorSecundario,
              colorAcento: prefs.colorAcento
            });
          }
        } catch (error) {
        }
      }
    }
    
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        this.applyTheme(theme);
        this.themeSubject.next(theme);
      } catch (error) {
      }
    }
  }

  public updateTheme(theme: ColorTheme) {
    this.applyTheme(theme);
    this.themeSubject.next(theme);
    localStorage.setItem('colorTheme', JSON.stringify(theme));
    
    // También actualizar las preferencias generales para mantener sincronización
    this.updatePreferences(theme);
  }

  private updatePreferences(theme: ColorTheme) {
    const preferenciasGuardadas = localStorage.getItem('preferenciasApp');
    let preferencias = preferenciasGuardadas ? JSON.parse(preferenciasGuardadas) : {};
    
    // Actualizar solo los colores en las preferencias
    preferencias.colorPrimario = theme.colorPrimario;
    preferencias.colorSecundario = theme.colorSecundario;
    preferencias.colorAcento = theme.colorAcento;
    
    localStorage.setItem('preferenciasApp', JSON.stringify(preferencias));
  }

  private applyTheme(theme: ColorTheme) {
    const root = document.documentElement;
    
    // Aplicar colores principales
    root.style.setProperty('--ion-color-primary', theme.colorPrimario);
    root.style.setProperty('--ion-color-secondary', theme.colorSecundario);
    root.style.setProperty('--ion-color-tertiary', theme.colorAcento);
    
    // Generar colores derivados para mejor contraste
    root.style.setProperty('--ion-color-primary-shade', this.oscurecerColor(theme.colorPrimario, 0.1));
    root.style.setProperty('--ion-color-primary-tint', this.aclararColor(theme.colorPrimario, 0.1));
    root.style.setProperty('--ion-color-secondary-shade', this.oscurecerColor(theme.colorSecundario, 0.1));
    root.style.setProperty('--ion-color-secondary-tint', this.aclararColor(theme.colorSecundario, 0.1));
    root.style.setProperty('--ion-color-tertiary-shade', this.oscurecerColor(theme.colorAcento, 0.1));
    root.style.setProperty('--ion-color-tertiary-tint', this.aclararColor(theme.colorAcento, 0.1));
  }

  private oscurecerColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  private aclararColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.floor(r + (255 - r) * factor);
    const newG = Math.floor(g + (255 - g) * factor);
    const newB = Math.floor(b + (255 - b) * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  public getCurrentTheme(): ColorTheme {
    return this.themeSubject.value;
  }

  public resetToDefault() {
    const defaultTheme: ColorTheme = {
      colorPrimario: '#3880ff',
      colorSecundario: '#3dc2ff',
      colorAcento: '#5260ff'
    };
    this.updateTheme(defaultTheme);
  }
}
