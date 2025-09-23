import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService, User } from './services/auth.service';
 import { AppInitService } from './services/app-init.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [
    { title: 'Detalle Mensual', url: '/gestion-mensual', icon: 'calendar' },
    { title: 'Presupuesto', url: '/registro-egresos', icon: 'add-circle' },
    { title: 'Egresos', url: '/gestion-egresos', icon: 'list' },
    { title: 'Reportes Anuales', url: '/reportes', icon: 'bar-chart' },
  ];
  
  
  public isAuthenticated = false;
  public currentUser: User | null = null;
  public isAuthReady = false;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private menuController: MenuController,
    private appInitService: AppInitService
  ) {}

  async ngOnInit() {
    // Inicializar la aplicación (cargar tema personalizado, etc.)
    await this.appInitService.initializeApp();
    
    // Esperar a que el AuthService se inicialice completamente
    await this.waitForAuthServiceInit();
    this.isAuthReady = true;
    
    // Suscribirse a los cambios de autenticación
    this.authSubscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        if (!isAuth) {
          this.menuController.close();
        }
      })
    );

    this.authSubscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  private async waitForAuthServiceInit(): Promise<void> {
    // Esperar hasta que el AuthService esté listo
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    while (!this.authService.isAuthReady() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Si después de 5 segundos no está listo, forzar logout
    if (!this.authService.isAuthReady()) {
      console.warn('AuthService no se inicializó correctamente, forzando logout');
      await this.authService.logout();
    }
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  async logout() {
    try {
      await this.authService.logout();
      this.menuController.close();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  goToProfile() {
    this.menuController.close();
    this.router.navigate(['/configuracion-usuario']);
  }
}
