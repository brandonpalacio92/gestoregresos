import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { EgresosService } from '../../services/egresos.service';
import { CategoriasService } from '../../services/categorias.service';
import { TiposEgresoService } from '../../services/tipos-egreso.service';
import { AuthService } from '../../services/auth.service';
import { Egreso } from '../../models/egreso.model';
import { Categoria } from '../../models/categoria.model';
import { TipoEgreso } from '../../models/tipo-egreso.model';

@Component({
  selector: 'app-registro-egresos',
  templateUrl: './registro-egresos.page.html',
  styleUrls: ['./registro-egresos.page.scss'],
  standalone: false
})
export class RegistroEgresosPage implements OnInit {
  formulario: FormGroup;
  tiposEgreso: TipoEgreso[] = [];
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  esPeriodico = false;
  
  // Propiedades para el modal de progreso
  modalProgresoAbierto = false;
  progresoEgresos = {
    total: 0,
    procesados: 0,
    mensaje: ''
  };

  constructor(
    private formBuilder: FormBuilder,
    private egresosService: EgresosService,
    private categoriasService: CategoriasService,
    private tiposEgresoService: TiposEgresoService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.formulario = this.formBuilder.group({
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      fecha: ['', Validators.required],
      tipoId: ['', Validators.required],
      categoriaId: ['', Validators.required],
      esPeriodico: [false],
      frecuencia: [''],
      fechaInicio: [''],
      fechaFin: [''],
      notas: ['']
    });
  }

  ngOnInit() {
    this.cargarTiposEgreso();
    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions() {
    // Suscripción para gastos periódicos
    this.formulario.get('esPeriodico')?.valueChanges.subscribe(value => {
      this.esPeriodico = value;
      if (value) {
        this.formulario.get('frecuencia')?.setValidators([Validators.required]);
        this.formulario.get('fechaInicio')?.setValidators([Validators.required]);
        
        // Forzar actualización de fecha de inicio con la fecha principal
        const fechaPrincipal = this.formulario.get('fecha')?.value;
        if (fechaPrincipal) {
          this.formulario.get('fechaInicio')?.setValue(fechaPrincipal);
        }
      } else {
        this.formulario.get('frecuencia')?.clearValidators();
        this.formulario.get('fechaInicio')?.clearValidators();
        // Limpiar valores cuando no es periódico
        this.formulario.get('frecuencia')?.setValue('');
        this.formulario.get('fechaInicio')?.setValue('');
        this.formulario.get('fechaFin')?.setValue('');
      }
      this.formulario.get('frecuencia')?.updateValueAndValidity();
      this.formulario.get('fechaInicio')?.updateValueAndValidity();
    });

    // Suscripción para la fecha principal - actualizar fecha de inicio automáticamente
    this.formulario.get('fecha')?.valueChanges.subscribe(fecha => {
      if (this.esPeriodico && fecha) {
        this.formulario.get('fechaInicio')?.setValue(fecha);
      }
    });

    // Suscripción para cambios en el tipo seleccionado
    this.formulario.get('tipoId')?.valueChanges.subscribe(tipoId => {
      if (tipoId) {
        this.cargarCategoriasPorTipo(tipoId);
        // Limpiar la categoría seleccionada cuando cambia el tipo
        this.formulario.patchValue({ categoriaId: '' });
      } else {
        this.categoriasFiltradas = [];
        this.formulario.patchValue({ categoriaId: '' });
      }
    });

    // Suscripción para cambios en la categoría seleccionada
    this.formulario.get('categoriaId')?.valueChanges.subscribe(categoriaId => {
      if (categoriaId) {
        const categoriaSeleccionada = this.categoriasFiltradas.find(cat => cat.id === categoriaId);
        if (categoriaSeleccionada) {
          // Aquí puedes agregar lógica adicional cuando se selecciona una categoría
        }
      }
    });
  }

  async cargarTiposEgreso() {
    try {
      const respuesta = await firstValueFrom(this.tiposEgresoService.getTiposEgreso());
  
      if (!respuesta || !Array.isArray(respuesta)) {
        this.mostrarMensaje('Respuesta inválida al cargar tipos de egreso', 'danger');
        return;
      }
  
      this.tiposEgreso = respuesta;
  
      try {
        this.tiposEgreso.sort((a, b) => a.orden - b.orden);
      } catch (ordenError) {
      }
  
      if (this.tiposEgreso.length === 1) {
        try {
          this.formulario.patchValue({ tipoId: this.tiposEgreso[0].id });
        } catch (patchError) {
        }
      }
  
    } catch (error: any) {
      const tipoError = error?.name || typeof error;
      const mensajeError = error?.message || 'Sin mensaje';
      this.mostrarMensaje('Error al cargar los tipos disponibles', 'danger');
    }
  }

  async cargarCategoriasPorTipo(tipoId: string) {
    try {
      this.categoriasFiltradas = await firstValueFrom(
        this.tiposEgresoService.getCategoriasPorTipo(tipoId)) || [];
      // Ordenar categorías por orden para mejor UX
      this.categoriasFiltradas.sort((a, b) => a.orden - b.orden);
      
      // Si solo hay una categoría, seleccionarla automáticamente
      if (this.categoriasFiltradas.length === 1) {
        this.formulario.patchValue({ categoriaId: this.categoriasFiltradas[0].id });
      }
    } catch (error) {
      this.mostrarMensaje('Error al cargar las categorías disponibles', 'danger');
    }
  }

  async guardarEgreso() {
    if (this.formulario.valid) {
      try {
        const egresoData = this.formulario.value;
        
        // Obtener usuarioId del servicio de autenticación
        const currentUser = this.authService.getCurrentUserValue();
        if (!currentUser) {
          this.mostrarMensaje('No hay usuario autenticado', 'danger');
          return;
        }

        // Preparar datos para enviar al backend
        const egresoParaEnviar = {
          descripcion: egresoData.descripcion,
          monto: parseFloat(egresoData.monto),
          fecha: egresoData.fecha,
          categoriaId: egresoData.categoriaId,
          esPeriodico: egresoData.esPeriodico || false,
          frecuencia: egresoData.frecuencia || null,
          fechaInicio: egresoData.fechaInicio || null,
          fechaFin: egresoData.fechaFin || null,
          usuarioId: currentUser.id.toString(),
          estado: 'pendiente' as 'pendiente' | 'pagado' | 'vencido',
          notas: egresoData.notas || null
        };
        // Mostrar modal de progreso si es periódico
        if (egresoData.esPeriodico) {
          await this.mostrarModalProgreso();
        }
        
        const respuesta = await firstValueFrom(this.egresosService.crearEgreso(egresoParaEnviar)) as any;

        if (respuesta && respuesta.success) {
          const cantidad = respuesta.cantidad || 1;
          
          // Cerrar modal de progreso si estaba abierto
          if (egresoData.esPeriodico) {
            await this.cerrarModalProgreso();
          }
          
          this.mostrarMensaje(
            `Se crearon ${cantidad} registros de egreso exitosamente`, 
            'success'
          );
          this.formulario.reset();
          this.formulario.patchValue({ esPeriodico: false });
        }
      } catch (error: any) {
        // Cerrar modal de progreso en caso de error
        if (this.modalProgresoAbierto) {
          await this.cerrarModalProgreso();
        }
        
        this.mostrarMensaje('Error al guardar el egreso: ' + (error?.message || 'Error desconocido'), 'danger');
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  // Método para obtener el tipo seleccionado actualmente
  get tipoSeleccionado(): TipoEgreso | undefined {
    const tipoId = this.formulario.get('tipoId')?.value;
    return this.tiposEgreso.find(tipo => tipo.id === tipoId);
  }

  // Método para obtener la categoría seleccionada actualmente
  get categoriaSeleccionada(): Categoria | undefined {
    const categoriaId = this.formulario.get('categoriaId')?.value;
    return this.categoriasFiltradas.find(cat => cat.id === categoriaId);
  }

  // Método para obtener el color de la categoría seleccionada
  get colorCategoriaSeleccionada(): string {
    return this.categoriaSeleccionada?.color || '#3880ff';
  }

  private async mostrarMensaje(mensaje: string, tipo: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: tipo,
      position: 'top'
    });
    toast.present();
  }

  // Métodos para el modal de progreso
  async mostrarModalProgreso() {
    this.modalProgresoAbierto = true;
    this.progresoEgresos = {
      total: 0,
      procesados: 0,
      mensaje: 'Preparando egresos periódicos...'
    };
  }

  async cerrarModalProgreso() {
    this.modalProgresoAbierto = false;
    this.progresoEgresos = {
      total: 0,
      procesados: 0,
      mensaje: ''
    };
  }

  actualizarProgreso(total: number, procesados: number, mensaje: string) {
    this.progresoEgresos = {
      total,
      procesados,
      mensaje
    };
  }

  get porcentajeProgreso(): number {
    if (this.progresoEgresos.total === 0) return 0;
    return (this.progresoEgresos.procesados / this.progresoEgresos.total) * 100;
  }

  mostrarModalFecha = false;
fechaSeleccionada: string = '';

abrirSelectorFecha() {
  this.mostrarModalFecha = true;
}

cerrarSelectorFecha() {
  this.mostrarModalFecha = false;
}

seleccionarFecha(event: any) {
  this.fechaSeleccionada = event.detail.value;
  this.formulario.get('fecha')?.setValue(this.fechaSeleccionada);
}

  mostrarModalFechafin = false;
fechafinSeleccionada: string = '';
fechaMinimaFinal: string = '';
fechaMaximaFinal: string = '';

abrirSelectorFechafin() {
  // Establecer fechas mínima y máxima para el selector
  const fechaActual = new Date();
  this.fechaMinimaFinal = fechaActual.toISOString();
  
  // Fecha máxima: 50 años en el futuro
  const fechaMaxima = new Date();
  fechaMaxima.setFullYear(fechaMaxima.getFullYear() + 50);
  this.fechaMaximaFinal = fechaMaxima.toISOString();
  
  this.mostrarModalFechafin = true;
}

cerrarSelectorFechafin() {
  this.mostrarModalFechafin = false;
}

seleccionarFechafin(event: any) {
  this.fechafinSeleccionada = event.detail.value;
  this.formulario.get('fechaFin')?.setValue(this.fechafinSeleccionada);
}

seleccionarFechaFinalRapida(periodo: string) {
  const fechaInicio = new Date(this.formulario.get('fecha')?.value);
  let fechaFinal = new Date(fechaInicio);
  
  switch(periodo) {
    case '5años':
      fechaFinal.setFullYear(fechaInicio.getFullYear() + 5);
      break;
    case '10años':
      fechaFinal.setFullYear(fechaInicio.getFullYear() + 10);
      break;
    case '20años':
      fechaFinal.setFullYear(fechaInicio.getFullYear() + 20);
      break;
  }
  
  this.fechafinSeleccionada = fechaFinal.toISOString();
  this.formulario.get('fechaFin')?.setValue(this.fechafinSeleccionada);
  this.cerrarSelectorFechafin();
}

  async mostrarConfirmacion() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres guardar este egreso?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: () => {
            this.guardarEgreso();
          }
        }
      ]
    });
    alert.present();
  }
}

