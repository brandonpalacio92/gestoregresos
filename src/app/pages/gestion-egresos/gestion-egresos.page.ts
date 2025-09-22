import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EgresosService } from '../../services/egresos.service';
import { CategoriasService } from '../../services/categorias.service';
import { TiposEgresoService } from '../../services/tipos-egreso.service';
import { AuthService } from '../../services/auth.service';
import { Egreso } from '../../models/egreso.model';
import { Categoria } from '../../models/categoria.model';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-gestion-egresos',
  templateUrl: './gestion-egresos.page.html',
  styleUrls: ['./gestion-egresos.page.scss'],
  standalone: false
})
export class GestionEgresosPage implements OnInit {
  egresos: Egreso[] = [];
  categorias: Categoria[] = [];
  tiposEgreso: any[] = [];
  egresosFiltrados: Egreso[] = [];
  cargando = false;
  filtrosConfigurados = false;
  
  // Filtros
  filtroEstado: string = 'todos';
  filtroTipoEgreso: string = 'todos';
  filtroPeriodo: string = 'mes';
  
  // Propiedades para filtro personalizado de mes/año
  mesSeleccionado: number = new Date().getMonth() + 1;
  anioSeleccionado: number = new Date().getFullYear();
  mostrarSelectorPersonalizado = false;
  
  // Propiedades para acordeones
  resumenExpandido = true;
  filtrosExpandido = true;
  egresosExpandido = true;
  
  // Modal de pago parcial
  modalPagoParcialAbierto = false;
  egresoSeleccionado: Egreso | null = null;
  montoPagoParcial: number = 0;
  
  // Modal de período personalizado
  modalPersonalizadoAbierto = false;
  
  // Estados disponibles
  estados = [
    { valor: 'todos', label: 'Todos' },
    { valor: 'pendiente', label: 'Pendientes' },
    { valor: 'pagado', label: 'Pagados' },
    { valor: 'parcializado', label: 'Parcializados' }
  ];

  constructor(
    private egresosService: EgresosService,
    private categoriasService: CategoriasService,
    private tiposEgresoService: TiposEgresoService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarTiposEgreso();
  }

  async cargarTiposEgreso() {
    try {
      console.log('🔄 Iniciando carga de tipos de egreso...');
      // Cargar todos los tipos de egreso disponibles
      this.tiposEgreso = await firstValueFrom(this.tiposEgresoService.getTiposEgreso());
      console.log(`📋 Cargados ${this.tiposEgreso.length} tipos de egreso`);
      
      // Log para debug
      console.log('📋 Tipos de egreso cargados:', this.tiposEgreso.map(t => ({ id: t.id, nombre: t.nombre })));
      console.log('📋 Array completo de tipos:', this.tiposEgreso);
    } catch (error) {
      console.error('❌ Error al cargar tipos de egreso:', error);
    }
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      const currentUser = this.authService.getCurrentUserValue();
      if (!currentUser) {
        console.error('No hay usuario autenticado');
        return;
      }

      const usuarioId = currentUser.id.toString();
      
      // Preparar filtros para enviar al backend
      const filtros: {estado?: string, tipoEgresoId?: string, periodo?: string, mes?: number, año?: number} = {};
      
      if (this.filtroEstado !== 'todos') {
        filtros.estado = this.filtroEstado;
      }
      if (this.filtroTipoEgreso !== 'todos') {
        filtros.tipoEgresoId = this.filtroTipoEgreso;
      }
      if (this.filtroPeriodo) {
        if (this.filtroPeriodo === 'personalizado') {
          filtros.periodo = 'personalizado';
          filtros.mes = this.mesSeleccionado;
          filtros.año = this.anioSeleccionado;
          console.log('🎯 Filtro personalizado configurado:', {
            mes: this.mesSeleccionado,
            año: this.anioSeleccionado,
            periodo: 'personalizado'
          });
        } else {
          filtros.periodo = this.filtroPeriodo;
          console.log('🎯 Filtro período estándar configurado:', {
            periodo: this.filtroPeriodo
          });
        }
      }
      
      console.log('🔍 Enviando filtros al backend:', filtros);
      console.log('🔍 Valores de filtros:', {
        filtroEstado: this.filtroEstado,
        filtroTipoEgreso: this.filtroTipoEgreso,
        filtroPeriodo: this.filtroPeriodo,
        mesSeleccionado: this.mesSeleccionado,
        anioSeleccionado: this.anioSeleccionado,
        mostrarSelectorPersonalizado: this.mostrarSelectorPersonalizado
      });
      console.log('🔍 Filtros que se enviarán:', {
        estado: filtros.estado || 'todos',
        tipoEgresoId: filtros.tipoEgresoId || 'todos', 
        periodo: filtros.periodo || 'todos',
        mes: filtros.mes || 'no especificado',
        año: filtros.año || 'no especificado'
      });
      
      // Cargar egresos con filtros
      const egresos = await firstValueFrom(this.egresosService.getEgresos(usuarioId, filtros));
      
      console.log('📥 Datos recibidos del backend:', egresos);
      console.log('📥 Cantidad de egresos recibidos:', egresos.length);
      
      // Convertir fechas de string a Date y monto a número
      const egresosConvertidos = egresos.map(egreso => ({
        ...egreso,
        monto: parseFloat(egreso.monto.toString()), // Asegurar que monto sea número
        fecha: new Date(egreso.fecha),
        fechaInicio: egreso.fechaInicio ? new Date(egreso.fechaInicio) : undefined,
        fechaFin: egreso.fechaFin ? new Date(egreso.fechaFin) : undefined,
        createdAt: egreso.createdAt ? new Date(egreso.createdAt) : undefined,
        updatedAt: egreso.updatedAt ? new Date(egreso.updatedAt) : undefined
      }));
      
      // Filtrar registros parcializados (solo para cálculos, no para visualización)
      this.egresos = egresosConvertidos.filter(egreso => egreso.estado !== 'parcializado');
      
      // Los datos ya vienen filtrados del backend, solo los asignamos
      this.egresosFiltrados = [...this.egresos];
      this.filtrosConfigurados = true;
      
      console.log(`📊 Cargados ${this.egresos.length} egresos activos (excluyendo ${egresos.length - this.egresos.length} parcializados) para el usuario ${usuarioId}`);
      
      // Log de indicadores para verificación
      console.log('📈 Indicadores calculados:', {
        totalEgresos: this.getTotalEgresos(),
        totalPendientes: this.getTotalPendientes(),
        totalPagados: this.getTotalPagados(),
        cantidadEgresos: this.egresosFiltrados.length
      });
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async aplicarFiltros() {
    // Recargar datos con los nuevos filtros
    await this.cargarDatos();
  }


  async onFiltroChange() {
    // Siempre recargar datos con los nuevos filtros
    await this.cargarDatos();
  }

  onPeriodoChange() {
    if (this.filtroPeriodo === 'personalizado') {
      this.mostrarSelectorPersonalizado = true;
    } else {
      this.mostrarSelectorPersonalizado = false;
      this.aplicarFiltros();
    }
  }

  onMesAnioChange() {
    this.aplicarFiltros();
  }

  getMeses() {
    return [
      { valor: 1, nombre: 'Enero' },
      { valor: 2, nombre: 'Febrero' },
      { valor: 3, nombre: 'Marzo' },
      { valor: 4, nombre: 'Abril' },
      { valor: 5, nombre: 'Mayo' },
      { valor: 6, nombre: 'Junio' },
      { valor: 7, nombre: 'Julio' },
      { valor: 8, nombre: 'Agosto' },
      { valor: 9, nombre: 'Septiembre' },
      { valor: 10, nombre: 'Octubre' },
      { valor: 11, nombre: 'Noviembre' },
      { valor: 12, nombre: 'Diciembre' }
    ];
  }

  getAnios() {
    const anioActual = new Date().getFullYear();
    const anios = [];
    for (let i = anioActual - 2; i <= anioActual + 2; i++) {
      anios.push(i);
    }
    return anios;
  }

  // Helper para validar fechas
  isValidDate(date: any): boolean {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  // Helper para mostrar filtros aplicados
  getFiltrosAplicados(): string {
    const filtros = [];
    
    if (this.filtroEstado !== 'todos') {
      const estado = this.estados.find(e => e.valor === this.filtroEstado);
      filtros.push(`Estado: ${estado?.label || this.filtroEstado}`);
    }
    
    if (this.filtroTipoEgreso !== 'todos') {
      const tipo = this.tiposEgreso.find(t => t.id === this.filtroTipoEgreso);
      filtros.push(`Tipo: ${tipo?.nombre || this.filtroTipoEgreso}`);
    }
    
    if (this.filtroPeriodo) {
      const periodos = [
        { valor: 'proximos', label: 'Próximos 7 días' },
        { valor: 'mes', label: 'Este mes' }
      ];
      const periodo = periodos.find(p => p.valor === this.filtroPeriodo);
      filtros.push(`Período: ${periodo?.label || this.filtroPeriodo}`);
    }
    
    return filtros.length > 0 ? filtros.join(', ') : 'Ninguno';
  }

  // Limpiar todos los filtros
  async limpiarFiltros() {
    this.filtroEstado = 'todos';
    this.filtroTipoEgreso = 'todos';
    this.filtroPeriodo = 'mes';
    this.filtrosConfigurados = false;
    this.egresos = [];
    this.egresosFiltrados = [];
  }

  // Métodos para controlar acordeones
  toggleResumen() {
    this.resumenExpandido = !this.resumenExpandido;
  }

  toggleFiltros() {
    this.filtrosExpandido = !this.filtrosExpandido;
  }

  toggleEgresos() {
    this.egresosExpandido = !this.egresosExpandido;
  }

  // Métodos para modal de período personalizado
  abrirModalPersonalizado() {
    this.modalPersonalizadoAbierto = true;
  }

  cerrarModalPersonalizado() {
    this.modalPersonalizadoAbierto = false;
  }

  aplicarPeriodoPersonalizado() {
    if (this.mesSeleccionado && this.anioSeleccionado) {
      this.onMesAnioChange();
      this.cerrarModalPersonalizado();
    }
  }

  // Método helper para obtener el nombre del mes
  getNombreMes(valor: number): string {
    const mes = this.getMeses().find(m => m.valor === valor);
    return mes ? mes.nombre : 'Seleccionar Mes';
  }

  // Método para formatear moneda
  formatearMoneda(monto: number | string): string {
    const valor = typeof monto === 'string' ? parseFloat(monto) : monto;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  // Método para eliminar un egreso
  async eliminarEgreso(egreso: Egreso) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el egreso "${egreso.descripcion}" por ${this.formatearMoneda(egreso.monto)}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              console.log('🗑️ Eliminando egreso:', egreso.id);
              
              await firstValueFrom(this.egresosService.eliminarEgreso(egreso.id));
              
              // Remover el egreso de las listas locales
              this.egresos = this.egresos.filter(e => e.id !== egreso.id);
              this.egresosFiltrados = this.egresosFiltrados.filter(e => e.id !== egreso.id);
              
              console.log('✅ Egreso eliminado exitosamente');
              
              // Mostrar toast de confirmación
              const toast = await this.toastController.create({
                message: 'Egreso eliminado exitosamente',
                duration: 2000,
                color: 'success',
                position: 'top'
              });
              await toast.present();
              
            } catch (error) {
              console.error('❌ Error al eliminar egreso:', error);
              
              const toast = await this.toastController.create({
                message: 'Error al eliminar el egreso',
                duration: 3000,
                color: 'danger',
                position: 'top'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async cambiarEstado(egreso: Egreso, nuevoEstado: 'pendiente' | 'pagado' | 'vencido') {
    try {
      const egresoActualizado = await firstValueFrom(
        this.egresosService.actualizarEgreso(egreso.id, { estado: nuevoEstado })
      );
      
      if (egresoActualizado) {
        // Actualizar el egreso en la lista local
        const index = this.egresos.findIndex(e => e.id === egreso.id);
        if (index !== -1) {
          this.egresos[index] = { ...this.egresos[index], estado: nuevoEstado };
          this.aplicarFiltros();
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  }

  async marcarComoPagado(egreso: Egreso) {
    await this.cambiarEstado(egreso, 'pagado');
  }

  async marcarComoPendiente(egreso: Egreso) {
    await this.cambiarEstado(egreso, 'pendiente');
  }


  getCategoriaNombre(egreso: Egreso): string {
    // Usar datos del JOIN si están disponibles, sino buscar en categorías
    if (egreso.categoria_nombre) {
      return egreso.categoria_nombre;
    }
    const categoria = this.categorias.find(c => c.id === egreso.categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  getCategoriaColor(egreso: Egreso): string {
    // Colores por defecto según el tipo de categoría
    const categoriaNombre = this.getCategoriaNombre(egreso).toLowerCase();
    
    if (categoriaNombre.includes('hogar') || categoriaNombre.includes('alquiler')) return '#e74c3c';
    if (categoriaNombre.includes('transporte') || categoriaNombre.includes('gasolina')) return '#3498db';
    if (categoriaNombre.includes('alimentación') || categoriaNombre.includes('supermercado')) return '#2ecc71';
    if (categoriaNombre.includes('salud') || categoriaNombre.includes('médico')) return '#9b59b6';
    if (categoriaNombre.includes('educación') || categoriaNombre.includes('libros')) return '#f39c12';
    if (categoriaNombre.includes('entretenimiento') || categoriaNombre.includes('cine')) return '#e67e22';
    
    return '#95a5a6'; // Color por defecto
  }

  getCategoriaIcono(egreso: Egreso): string {
    // Iconos por defecto según el tipo de categoría
    const categoriaNombre = this.getCategoriaNombre(egreso).toLowerCase();
    
    if (categoriaNombre.includes('hogar') || categoriaNombre.includes('alquiler')) return 'home-outline';
    if (categoriaNombre.includes('transporte') || categoriaNombre.includes('gasolina')) return 'car-outline';
    if (categoriaNombre.includes('alimentación') || categoriaNombre.includes('supermercado')) return 'restaurant-outline';
    if (categoriaNombre.includes('salud') || categoriaNombre.includes('médico')) return 'medical-outline';
    if (categoriaNombre.includes('educación') || categoriaNombre.includes('libros')) return 'school-outline';
    if (categoriaNombre.includes('entretenimiento') || categoriaNombre.includes('cine')) return 'play-outline';
    
    return 'help-circle-outline'; // Icono por defecto
  }


  getTotalEgresos(): number {
    const total = this.egresosFiltrados.reduce((total, egreso) => total + egreso.monto, 0);
    console.log('💰 Total egresos calculado:', total, 'de', this.egresosFiltrados.length, 'egresos');
    return total;
  }

  getTotalPendientes(): number {
    const pendientes = this.egresosFiltrados.filter(e => e.estado === 'pendiente');
    const total = pendientes.reduce((total, egreso) => total + egreso.monto, 0);
    console.log('⏳ Total pendientes calculado:', total, 'de', pendientes.length, 'egresos pendientes');
    return total;
  }


  getTotalPagados(): number {
    const pagados = this.egresosFiltrados.filter(e => e.estado === 'pagado');
    const total = pagados.reduce((total, egreso) => total + egreso.monto, 0);
    console.log('✅ Total pagados calculado:', total, 'de', pagados.length, 'egresos pagados');
    return total;
  }

  // Métodos simples para mostrar estados
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pagado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'vencido':
        return 'danger';
      case 'parcializado':
        return 'primary';
      default:
        return 'medium';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pagado':
        return 'Pagado';
      case 'pendiente':
        return 'Pendiente';
      case 'vencido':
        return 'Vencido';
      case 'parcializado':
        return 'Parcializado';
      default:
        return estado;
    }
  }

  // Métodos para pagos tardíos
  esPagoTardio(egreso: Egreso): boolean {
    if (egreso.estado !== 'pagado') return false;
    
    const hoy = new Date();
    const fechaEgreso = new Date(egreso.fecha);
    return fechaEgreso < hoy;
  }

  esPagoATiempo(egreso: Egreso): boolean {
    if (egreso.estado !== 'pagado') return false;
    
    const hoy = new Date();
    const fechaEgreso = new Date(egreso.fecha);
    return fechaEgreso >= hoy;
  }

  getTotalPagosTardios(): number {
    const pagosTardios = this.egresosFiltrados.filter(e => this.esPagoTardio(e));
    const total = pagosTardios.reduce((total, egreso) => total + egreso.monto, 0);
    console.log('⚠️ Total pagos tardíos calculado:', total, 'de', pagosTardios.length, 'egresos');
    return total;
  }

  getTotalPagosATiempo(): number {
    const pagosATiempo = this.egresosFiltrados.filter(e => this.esPagoATiempo(e));
    const total = pagosATiempo.reduce((total, egreso) => total + egreso.monto, 0);
    console.log('✅ Total pagos a tiempo calculado:', total, 'de', pagosATiempo.length, 'egresos');
    return total;
  }

  // Métodos para pago parcial
  abrirModalPagoParcial(egreso: Egreso): void {
    this.egresoSeleccionado = egreso;
    this.montoPagoParcial = 0;
    this.modalPagoParcialAbierto = true;
  }

  // Helper para convertir campos de camelCase a snake_case para el backend
  private convertirParaBackend(egreso: any): any {
    console.log('🔍 Objeto egreso antes de convertir:', egreso);
    
    const resultado = {
      descripcion: egreso.descripcion,
      monto: egreso.monto,
      fecha: egreso.fecha,
      categoriaId: egreso.categoriaId,        // El backend espera camelCase
      esPeriodico: egreso.esPeriodico,        // El backend espera camelCase
      frecuencia: egreso.frecuencia,
      fechaInicio: egreso.fechaInicio,        // El backend espera camelCase
      fechaFin: egreso.fechaFin,              // El backend espera camelCase
      usuarioId: egreso.usuarioId,            // El backend espera camelCase
      estado: egreso.estado,
      notas: egreso.notas
    };
    
    console.log('🔍 Objeto egreso después de convertir:', resultado);
    return resultado;
  }

  cerrarModalPagoParcial(): void {
    this.modalPagoParcialAbierto = false;
    this.egresoSeleccionado = null;
    this.montoPagoParcial = 0;
  }

  calcularSaldoPendiente(): number {
    if (!this.egresoSeleccionado || !this.montoPagoParcial) return 0;
    return this.egresoSeleccionado.monto - this.montoPagoParcial;
  }

  async procesarPagoParcial(): Promise<void> {
    if (!this.egresoSeleccionado || !this.montoPagoParcial) return;

    // Validar que el monto del pago parcial no exceda el monto original
    if (this.montoPagoParcial >= this.egresoSeleccionado.monto) {
      console.log('❌ El monto del pago parcial debe ser menor al monto total');
      // Aquí podrías mostrar un toast o alerta al usuario
      return;
    }

    // Validar que el monto sea mayor a 0
    if (this.montoPagoParcial <= 0) {
      console.log('❌ El monto del pago parcial debe ser mayor a 0');
      return;
    }

    try {
      const saldoPendiente = this.calcularSaldoPendiente();
      
      console.log('💳 Procesando pago parcial:', {
        egresoOriginal: this.egresoSeleccionado.descripcion,
        montoOriginal: this.egresoSeleccionado.monto,
        montoAbonado: this.montoPagoParcial,
        saldoPendiente: saldoPendiente
      });

      // TRANSACCIÓN: Crear todos los registros primero, luego actualizar el original
      
      // 1. Preparar egreso del abono (Pagado)
      const egresoSeleccionado = this.egresoSeleccionado as any; // Cast para acceder a campos snake_case
      const egresoAbono = {
        descripcion: `${egresoSeleccionado.descripcion} (Abono)`,
        monto: this.montoPagoParcial,
        fecha: egresoSeleccionado.fecha,
        categoriaId: egresoSeleccionado.categoria_id,  // Usar snake_case del backend
        esPeriodico: false, // Los abonos no son periódicos
        frecuencia: undefined,
        fechaInicio: undefined,
        fechaFin: undefined,
        usuarioId: egresoSeleccionado.usuario_id,      // Usar snake_case del backend
        estado: 'pagado' as const,
        notas: `Abono de pago parcial. Monto original: ${egresoSeleccionado.monto}`
      };

      console.log('🔍 Egreso abono creado:', egresoAbono);
      console.log('🔍 EgresoSeleccionado:', this.egresoSeleccionado);
      console.log('🔍 CategoriaId del seleccionado:', this.egresoSeleccionado.categoriaId);
      console.log('🔍 UsuarioId del seleccionado:', this.egresoSeleccionado.usuarioId);

      // 2. Preparar egreso del saldo pendiente
      const egresoSaldo = {
        descripcion: `${egresoSeleccionado.descripcion} (Saldo pendiente)`,
        monto: saldoPendiente,
        fecha: egresoSeleccionado.fecha,
        categoriaId: egresoSeleccionado.categoria_id,  // Usar snake_case del backend
        esPeriodico: egresoSeleccionado.es_periodico || false,  // Usar snake_case del backend
        frecuencia: egresoSeleccionado.frecuencia || undefined,
        fechaInicio: egresoSeleccionado.fecha_inicio || undefined,  // Usar snake_case del backend
        fechaFin: egresoSeleccionado.fecha_fin || undefined,        // Usar snake_case del backend
        usuarioId: egresoSeleccionado.usuario_id,      // Usar snake_case del backend
        estado: 'pendiente' as const,
        notas: `Saldo pendiente de pago parcial. Monto original: ${egresoSeleccionado.monto}, abonado: ${this.montoPagoParcial}`
      };

      console.log('🔍 Egreso saldo creado:', egresoSaldo);

      // 3. Crear los nuevos registros primero
      console.log('🔄 Creando registros de abono y saldo...');
      
      const egresoAbonoBackend = this.convertirParaBackend(egresoAbono);
      const egresoSaldoBackend = this.convertirParaBackend(egresoSaldo);
      
      console.log('📤 Payload del abono:', egresoAbonoBackend);
      console.log('📤 Payload del saldo:', egresoSaldoBackend);
      
      const [abonoCreado, saldoCreado] = await Promise.all([
        firstValueFrom(this.egresosService.crearEgreso(egresoAbonoBackend)),
        firstValueFrom(this.egresosService.crearEgreso(egresoSaldoBackend))
      ]);

      console.log('✅ Registros creados exitosamente:', {
        abono: abonoCreado.id,
        saldo: saldoCreado.id
      });

      // 4. Solo después de crear los nuevos registros, actualizar el original
      console.log('🔄 Actualizando egreso original a parcializado...');
      const egresoOriginalActualizado = {
        ...egresoSeleccionado,
        estado: 'parcializado' as const,
        notas: `Parcializado - Abonado: ${this.montoPagoParcial}, Saldo: ${saldoPendiente}. ${egresoSeleccionado.notas || ''}`
      };

      await firstValueFrom(this.egresosService.actualizarEgreso(egresoSeleccionado.id, egresoOriginalActualizado));

      // 5. Recargar los datos
      await this.cargarDatos();
      
      // 6. Cerrar modal
      this.cerrarModalPagoParcial();

      console.log('✅ Pago parcial procesado exitosamente - 3 registros creados');
      
    } catch (error) {
      console.error('❌ Error al procesar pago parcial:', error);
      // En caso de error, los registros creados quedarán, pero el original no se marcará como parcializado
    }
  }
}
