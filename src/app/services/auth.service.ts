import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_nacimiento?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthError {
  success: false;
  message: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://192.168.1.7:3000/api/auth';
  //private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.init();
  }

  private async init() {
    try {
      await this.storage.create();
      await this.loadStoredAuth();
    } catch (error) {
      console.error('Error inicializando AuthService:', error);
      // Asegurar que siempre se limpien los datos en caso de error
      await this.clearAuthData();
    }
  }

  // Cargar datos de autenticación almacenados
  private async loadStoredAuth() {
    try {
      const [accessToken, userData] = await Promise.all([
        this.storage.get(this.ACCESS_TOKEN_KEY),
        this.storage.get(this.USER_KEY)
      ]);

      if (accessToken && userData) {
        // Verificar que el token no esté expirado (básico)
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp > now) {
              // Token válido
              this.currentUserSubject.next(userData);
              this.isAuthenticatedSubject.next(true);
            } else {
              // Token expirado
              console.log('Token expirado, limpiando datos');
              await this.clearAuthData();
            }
          } catch (error) {
            console.error('Error decodificando token:', error);
            await this.clearAuthData();
          }
        } else {
          // Token inválido
          console.log('Token inválido, limpiando datos');
          await this.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error cargando autenticación almacenada:', error);
      await this.clearAuthData();
    }
  }

  // Registrar nuevo usuario
  register(userData: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    fecha_nacimiento?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(async (response) => {
          if (response.success) {
            await this.setAuthData(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Iniciar sesión
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(async (response) => {
          if (response.success) {
            await this.setAuthData(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      // Limpiar datos locales PRIMERO para evitar bucles
      await this.clearAuthData();
      
      // Opcional: notificar al servidor (sin bloquear)
      const accessToken = await this.storage.get(this.ACCESS_TOKEN_KEY);
      if (accessToken) {
        this.http.post(`${this.API_URL}/logout`, {}).subscribe({
          next: () => console.log('Logout notificado al servidor'),
          error: (error) => console.warn('Error notificando logout al servidor:', error)
        });
      }
    } catch (error) {
      console.warn('Error en logout:', error);
      // Asegurar que siempre se limpien los datos
      await this.clearAuthData();
    }
  }

  // Renovar token
  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    return new Observable(observer => {
      this.storage.get(this.REFRESH_TOKEN_KEY).then(refreshToken => {
        if (!refreshToken) {
          observer.error('No hay refresh token disponible');
          return;
        }

        this.http.post(`${this.API_URL}/refresh`, { refreshToken })
          .subscribe({
            next: (response: any) => {
              if (response.success) {
                this.storage.set(this.ACCESS_TOKEN_KEY, response.data.accessToken);
                this.storage.set(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
                observer.next(response.data);
                observer.complete();
              } else {
                observer.error(response.message);
              }
            },
            error: (error) => {
              console.error('Error renovando token:', error);
              this.logout();
              observer.error(error);
            }
          });
      });
    });
  }

  // Obtener información del usuario actual
  getCurrentUser(): Observable<User> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.API_URL}/me`)
      .pipe(
        map(response => response.data.user),
        tap(user => {
          this.currentUserSubject.next(user);
          this.storage.set(this.USER_KEY, user);
        }),
        catchError(this.handleError)
      );
  }

  // Actualizar perfil
  updateProfile(profileData: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    fecha_nacimiento?: string;
  }): Observable<User> {
    return this.http.put<{ success: boolean; data: { user: User } }>(`${this.API_URL}/profile`, profileData)
      .pipe(
        map(response => response.data.user),
        tap(user => {
          this.currentUserSubject.next(user);
          this.storage.set(this.USER_KEY, user);
        }),
        catchError(this.handleError)
      );
  }

  // Cambiar contraseña
  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener token de acceso
  async getAccessToken(): Promise<string | null> {
    return await this.storage.get(this.ACCESS_TOKEN_KEY);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Obtener usuario actual
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Verificar si la autenticación está lista
  isAuthReady(): boolean {
    return this.isAuthenticatedSubject.value !== undefined;
  }

  // Configurar datos de autenticación
  private async setAuthData(data: { user: User; accessToken: string; refreshToken: string }) {
    await Promise.all([
      this.storage.set(this.ACCESS_TOKEN_KEY, data.accessToken),
      this.storage.set(this.REFRESH_TOKEN_KEY, data.refreshToken),
      this.storage.set(this.USER_KEY, data.user)
    ]);

    this.currentUserSubject.next(data.user);
    this.isAuthenticatedSubject.next(true);
  }

  // Limpiar datos de autenticación
  private async clearAuthData() {
    await Promise.all([
      this.storage.remove(this.ACCESS_TOKEN_KEY),
      this.storage.remove(this.REFRESH_TOKEN_KEY),
      this.storage.remove(this.USER_KEY)
    ]);

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // Manejar errores HTTP
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Error en AuthService:', error);
    return throwError(() => new Error(errorMessage));
  };

  // Crear headers con token de autorización
  getAuthHeaders(): Observable<HttpHeaders> {
    return new Observable(observer => {
      this.getAccessToken().then(token => {
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        observer.next(headers);
        observer.complete();
      });
    });
  }
}
