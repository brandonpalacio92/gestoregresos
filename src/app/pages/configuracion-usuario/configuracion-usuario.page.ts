import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { ThemeService, ColorTheme } from '../../services/theme.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

interface PreferenciasApp {
  tema: 'claro' | 'oscuro' | 'auto';
  moneda: 'USD' | 'COP' | 'EUR';
  idioma: 'es' | 'en';
  notificaciones: boolean;
  recordatorios: boolean;
  resumenDiario: boolean;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
}

@Component({
  selector: 'app-configuracion-usuario',
  templateUrl: './configuracion-usuario.page.html',
  styleUrls: ['./configuracion-usuario.page.scss'],
  standalone: false
})
export class ConfiguracionUsuarioPage implements OnInit {

  // Propiedades para acordeones
  perfilExpandido = true;
  preferenciasExpandido = true;
  datosExpandido = true;
  notificacionesExpandido = true;
  seguridadExpandido = true;

  // Datos del usuario
  usuario: User | null = null;
  cargando = true;

  // Preferencias de la app
  preferencias: PreferenciasApp = {
    tema: 'auto',
    moneda: 'USD',
    idioma: 'es',
    notificaciones: true,
    recordatorios: true,
    resumenDiario: false,
    colorPrimario: '#3880ff',
    colorSecundario: '#3dc2ff',
    colorAcento: '#5260ff'
  };

  // Colores predefinidos para elegir
  coloresPredefinidos = [
    { nombre: 'Azul Clásico', primario: '#3880ff', secundario: '#3dc2ff', acento: '#5260ff' },
    { nombre: 'Verde Naturaleza', primario: '#2dd36f', secundario: '#28a745', acento: '#20c997' },
    { nombre: 'Púrpura Elegante', primario: '#7044ff', secundario: '#9c27b0', acento: '#e91e63' },
    { nombre: 'Naranja Energía', primario: '#ff6b35', secundario: '#ff8c00', acento: '#ff5722' },
    { nombre: 'Rosa Moderno', primario: '#e91e63', secundario: '#f06292', acento: '#f48fb1' },
    { nombre: 'Cian Fresco', primario: '#00bcd4', secundario: '#26c6da', acento: '#4dd0e1' },
    { nombre: 'Índigo Profesional', primario: '#3f51b5', secundario: '#5c6bc0', acento: '#7986cb' },
    { nombre: 'Teal Sofisticado', primario: '#009688', secundario: '#26a69a', acento: '#4db6ac' },
    { nombre: 'Rojo Pasión', primario: '#f44336', secundario: '#ef5350', acento: '#e57373' },
    { nombre: 'Ámbar Dorado', primario: '#ff9800', secundario: '#ffb74d', acento: '#ffcc02' }
  ];

  // Formulario de perfil
  perfilForm = {
    nombre: '',
    email: '',
    telefono: ''
  };

  // Formulario de cambio de contraseña
  cambioPasswordForm = {
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirmar: ''
  };

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.cargarDatosUsuario();
    await this.cargarPreferencias();
    // Cargar tema actual
    this.cargarTemaActual();
  }

  // Métodos para controlar acordeones
  togglePerfil() {
    this.perfilExpandido = !this.perfilExpandido;
  }

  togglePreferencias() {
    this.preferenciasExpandido = !this.preferenciasExpandido;
  }

  toggleDatos() {
    this.datosExpandido = !this.datosExpandido;
  }

  toggleNotificaciones() {
    this.notificacionesExpandido = !this.notificacionesExpandido;
  }

  toggleSeguridad() {
    this.seguridadExpandido = !this.seguridadExpandido;
  }

  // Cargar datos del usuario
  async cargarDatosUsuario() {
    try {
      this.cargando = true;
      const usuario = await firstValueFrom(this.authService.currentUser$);
      
      if (usuario) {
        this.usuario = usuario;
        this.perfilForm = {
          nombre: usuario.nombre || '',
          email: usuario.email || '',
          telefono: usuario.telefono || ''
        };
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    } finally {
      this.cargando = false;
    }
  }

  // Cargar preferencias (simulado - en una app real vendría de un servicio)
  async cargarPreferencias() {
    // Simular carga de preferencias desde localStorage
    const preferenciasGuardadas = localStorage.getItem('preferenciasApp');
    if (preferenciasGuardadas) {
      this.preferencias = { ...this.preferencias, ...JSON.parse(preferenciasGuardadas) };
    }
  }

  // Cargar tema actual
  cargarTemaActual() {
    const temaActual = this.themeService.getCurrentTheme();
    this.preferencias.colorPrimario = temaActual.colorPrimario;
    this.preferencias.colorSecundario = temaActual.colorSecundario;
    this.preferencias.colorAcento = temaActual.colorAcento;
  }

  // Guardar preferencias
  async guardarPreferencias() {
    try {
      localStorage.setItem('preferenciasApp', JSON.stringify(this.preferencias));
      
      // Actualizar tema con los colores actuales
      this.actualizarTema();
      
      const toast = await this.toastController.create({
        message: 'Preferencias guardadas exitosamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } catch (error) {
      console.error('Error guardando preferencias:', error);
    }
  }

  // Actualizar tema
  actualizarTema() {
    const tema: ColorTheme = {
      colorPrimario: this.preferencias.colorPrimario,
      colorSecundario: this.preferencias.colorSecundario,
      colorAcento: this.preferencias.colorAcento
    };
    this.themeService.updateTheme(tema);
  }

  // Seleccionar esquema de colores predefinido
  seleccionarEsquemaColor(esquema: any) {
    this.preferencias.colorPrimario = esquema.primario;
    this.preferencias.colorSecundario = esquema.secundario;
    this.preferencias.colorAcento = esquema.acento;
    
    // Aplicar inmediatamente para preview
    this.actualizarTema();
  }

  // Personalizar color individual
  personalizarColor(tipo: 'primario' | 'secundario' | 'acento', color: string) {
    const propiedad = `color${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` as keyof PreferenciasApp;
    (this.preferencias as any)[propiedad] = color;
    this.actualizarTema();
  }

  // Resetear a colores por defecto
  resetearColores() {
    this.preferencias.colorPrimario = '#3880ff';
    this.preferencias.colorSecundario = '#3dc2ff';
    this.preferencias.colorAcento = '#5260ff';
    this.themeService.resetToDefault();
  }

  // Actualizar perfil
  async actualizarPerfil() {
    const loading = await this.loadingController.create({
      message: 'Actualizando perfil...'
    });
    await loading.present();

    try {
      // Aquí iría la lógica para actualizar el perfil en el backend
      console.log('Actualizando perfil:', this.perfilForm);
      
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const toast = await this.toastController.create({
        message: 'Perfil actualizado exitosamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      
      const toast = await this.toastController.create({
        message: 'Error al actualizar el perfil',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  // Cambiar contraseña
  async cambiarPassword() {
    if (this.cambioPasswordForm.passwordNuevo !== this.cambioPasswordForm.passwordConfirmar) {
      const toast = await this.toastController.create({
        message: 'Las contraseñas no coinciden',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Cambiando contraseña...'
    });
    await loading.present();

    try {
      // Aquí iría la lógica para cambiar la contraseña en el backend
      console.log('Cambiando contraseña...');
      
      // Simular cambio de contraseña
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Limpiar formulario
      this.cambioPasswordForm = {
        passwordActual: '',
        passwordNuevo: '',
        passwordConfirmar: ''
      };
      
      const toast = await this.toastController.create({
        message: 'Contraseña cambiada exitosamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      
      const toast = await this.toastController.create({
        message: 'Error al cambiar la contraseña',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  // Exportar datos
  async exportarDatos() {
    const alert = await this.alertController.create({
      header: 'Exportar Datos',
      message: '¿Qué datos deseas exportar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Solo Egresos',
          handler: () => this.descargarDatos('egresos')
        },
        {
          text: 'Todos los Datos',
          handler: () => this.descargarDatos('completo')
        }
      ]
    });

    await alert.present();
  }

  // Descargar datos
  async descargarDatos(tipo: string) {
    try {
      // Simular exportación de datos
      const datos = {
        tipo: tipo,
        fecha: new Date().toISOString(),
        usuario: this.usuario?.email || 'usuario',
        datos: tipo === 'completo' ? 'Todos los datos del usuario' : 'Solo egresos'
      };

      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `datos_${tipo}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      const toast = await this.toastController.create({
        message: 'Datos exportados exitosamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
    } catch (error) {
      console.error('Error exportando datos:', error);
    }
  }

  // Cerrar sesión
  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: async () => {
            await this.authService.logout();
          }
        }
      ]
    });

    await alert.present();
  }
}
