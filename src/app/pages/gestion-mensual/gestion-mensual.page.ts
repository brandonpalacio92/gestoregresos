import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PresupuestoService } from '../../services/presupuesto.service';
import { EgresosService } from '../../services/egresos.service';
import { CategoriasService } from '../../services/categorias.service';
import { AuthService } from '../../services/auth.service';
import { PresupuestoMensual } from '../../models/presupuesto.model';
import { Egreso } from '../../models/egreso.model';
import { CategoriaConEgresos } from '../../models/categoria.model';

@Component({
  selector: 'app-gestion-mensual',
  templateUrl: './gestion-mensual.page.html',
  styleUrls: ['./gestion-mensual.page.scss'],
  standalone: false
})
export class GestionMensualPage implements OnInit {
  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();
  presupuestoMensual: PresupuestoMensual | null = null;
  egresos: Egreso[] = [];
  categoriasConEgresos: CategoriaConEgresos[] = [];
  estadisticasCategorias: any[] = [];
  cargando = true;
  usuarioId: string = '';
  // Propiedades para acordeones
  mesSelectorExpandido = true;
  resumenExpandido = true;
  analisisExpandido = true;
  categoriasExpandidas = false; // Inicia colapsado
  egresosExpandido = true;

  constructor(
    private presupuestoService: PresupuestoService,
    private egresosService: EgresosService,
    private categoriasService: CategoriasService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.obtenerUsuario();
  }

  async obtenerUsuario() {
    try {
      const user = await firstValueFrom(this.authService.currentUser$);
      if (user && user.id) {
        this.usuarioId = user.id.toString();
        this.cargarDatosMensuales();
      } else {

        this.cargando = false;
      }
    } catch (error) {

      this.cargando = false;
    }
  }

  async cargarDatosMensuales() {
    if (!this.usuarioId) {

      this.cargando = false;
      return;
    }

    this.cargando = true;
    try {

      // Cargar egresos del mes

      const egresosDelMes = await firstValueFrom(this.egresosService
        .getEgresosPorMes(this.usuarioId, this.mesActual, this.anioActual)) || [];

      // Filtrar registros parcializados (solo para cálculos, no para visualización)
      this.egresos = egresosDelMes.filter(egreso => egreso.estado !== 'parcializado');

      // Cargar estadísticas por categoría

      this.estadisticasCategorias = await firstValueFrom(this.egresosService
        .getEstadisticasMes(this.usuarioId, this.mesActual, this.anioActual)) || [];

      // Cargar presupuesto del mes (si existe)
      try {
        this.presupuestoMensual = await firstValueFrom(this.presupuestoService
          .getResumenMensual(this.usuarioId, this.mesActual, this.anioActual)) || null;
      } catch (error) {

        this.presupuestoMensual = null;
      }

      // Depuración: comparar cálculos
      this.debugCalculos();

    } catch (error) {

    } finally {
      this.cargando = false;
    }
  }

  debugCalculos() {

    // Cálculos del frontend
    const totalFrontend = this.getTotalEgresos();
    const pagadoFrontend = this.getTotalGastadoPagado();
    const pendienteFrontend = this.getTotalGastadoPendiente();

    // Cálculos del backend
    const totalBackend = this.getTotalGastadoPorCategoria();
    const pagadoBackend = this.getTotalGastadoPagadoBackend();
    const pendienteBackend = this.getTotalGastadoPendienteBackend();
    const pagosTardiosBackend = this.getTotalPagosTardios();

    // Verificar coherencia

  }

  cambiarMes(direccion: 'anterior' | 'siguiente') {
    if (direccion === 'anterior') {
      if (this.mesActual === 1) {
        this.mesActual = 12;
        this.anioActual--;
      } else {
        this.mesActual--;
      }
    } else {
      if (this.mesActual === 12) {
        this.mesActual = 1;
        this.anioActual++;
      } else {
        this.mesActual++;
      }
    }
    this.cargarDatosMensuales();
  }

  getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
  }

  getPorcentajeGasto(montoGastado: number, montoTotal: number): number {
    if (montoTotal === 0) return 0;
    return Math.min((montoGastado / montoTotal) * 100, 100);
  }

  getColorPorcentaje(porcentaje: number): string {
    if (porcentaje >= 90) return 'danger';
    if (porcentaje >= 75) return 'warning';
    return 'success';
  }

  getTotalEgresos(): number {

    if (!this.egresos || this.egresos.length === 0) {

      return 0;
    }
    
    const total = this.egresos.reduce((total, egreso) => {
      const monto = typeof egreso.monto === 'string' ? parseFloat(egreso.monto) : (egreso.monto || 0);
      const nuevoTotal = total + monto;

      return nuevoTotal;
    }, 0);

    return isNaN(total) ? 0 : total;
  }

  // Métodos para análisis de gastos por estado (frontend)
  getTotalGastadoPagado(): number {
    const total = this.egresos
      .filter(egreso => egreso.estado === 'pagado')
      .reduce((total, egreso) => {
        const monto = typeof egreso.monto === 'string' ? parseFloat(egreso.monto) : (egreso.monto || 0);
        return total + monto;
      }, 0);

    return total;
  }

  getTotalGastadoPendiente(): number {
    const total = this.egresos
      .filter(egreso => egreso.estado === 'pendiente')
      .reduce((total, egreso) => {
        const monto = typeof egreso.monto === 'string' ? parseFloat(egreso.monto) : (egreso.monto || 0);
        return total + monto;
      }, 0);

    return total;
  }

  getAhorro(): number {
    if (!this.presupuestoMensual) return 0;
    return this.presupuestoMensual.presupuesto_asignado - this.getTotalEgresos();
  }

  toggleCategorias() {
    this.categoriasExpandidas = !this.categoriasExpandidas;
  }

  // Métodos para controlar otros acordeones
  toggleMesSelector() {
    this.mesSelectorExpandido = !this.mesSelectorExpandido;
  }

  toggleResumen() {
    this.resumenExpandido = !this.resumenExpandido;
  }

  toggleAnalisis() {
    this.analisisExpandido = !this.analisisExpandido;
  }

  toggleEgresos() {
    this.egresosExpandido = !this.egresosExpandido;
  }

  getEgresosPendientes(): Egreso[] {
    return this.egresos.filter(egreso => egreso.estado === 'pendiente');
  }

  getEgresosPagados(): Egreso[] {
    return this.egresos.filter(egreso => egreso.estado === 'pagado');
  }

  // Métodos para estadísticas de categorías
  getTotalGastadoPorCategoria(): number {
    if (this.estadisticasCategorias.length === 0) {

      return this.getTotalEgresos();
    }
    return this.estadisticasCategorias.reduce((total, cat) => total + parseFloat(cat.monto_total), 0);
  }

  // Métodos para totales usando estadísticas del backend (más precisos)
  getTotalGastadoPagadoBackend(): number {
    if (this.estadisticasCategorias.length === 0) {

      return this.getTotalGastadoPagado();
    }
    const total = this.estadisticasCategorias.reduce((total, cat) => total + parseFloat(cat.monto_pagado || 0), 0);

    return total;
  }

  getTotalGastadoPendienteBackend(): number {
    if (this.estadisticasCategorias.length === 0) {

      return this.getTotalGastadoPendiente();
    }
    const total = this.estadisticasCategorias.reduce((total, cat) => total + parseFloat(cat.monto_pendiente || 0), 0);

    return total;
  }

  getTotalPagosTardios(): number {
    // Calcular pagos tardíos: egresos pagados con fecha de vencimiento pasada
    const hoy = new Date();

    const egresosPagados = this.egresos.filter(e => e.estado === 'pagado');

    const pagosTardios = this.egresos.filter(egreso => {
      if (!egreso || egreso.estado !== 'pagado') return false;
      
      const fechaEgreso = new Date(egreso.fecha);
      const esTardio = fechaEgreso < hoy;

      return esTardio;
    });
    
    const total = pagosTardios.reduce((total, egreso) => {
      const monto = typeof egreso.monto === 'string' ? parseFloat(egreso.monto) : (egreso.monto || 0);
      return total + monto;
    }, 0);

    return isNaN(total) ? 0 : total;
  }

  getPorcentajeCategoria(montoCategoria: number): number {
    const total = this.getTotalGastadoPorCategoria();
    if (total === 0) return 0;
    return (montoCategoria / total) * 100;
  }

  // Método para convertir string a number en el template
  parseFloat(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  // Método específico para obtener porcentaje de categoría desde el template
  getPorcentajeCategoriaTemplate(categoria: any): number {
    const monto = parseFloat(categoria.monto_total);
    return this.getPorcentajeCategoria(monto);
  }

  getColorCategoria(categoria: any): string {
    return categoria.categoria_color || '#666666';
  }

  getIconoCategoria(categoria: any): string {
    return categoria.categoria_icono || 'help-circle-outline';
  }

  // Métodos para análisis de tendencias
  getCategoriaMayorGasto(): any {
    if (this.estadisticasCategorias.length === 0) return null;
    return this.estadisticasCategorias.reduce((max, cat) => 
      parseFloat(cat.monto_total) > parseFloat(max.monto_total) ? cat : max
    );
  }

  getPromedioGastoDiario(): number {
    const hoy = new Date();
    const diasTranscurridos = hoy.getDate();
    const totalEgresos = this.getTotalEgresos();
    
    // Solo validar división por cero, no el total de egresos
    if (!diasTranscurridos || diasTranscurridos === 0) {

      return 0;
    }
    
    const promedio = totalEgresos / diasTranscurridos;

    return isNaN(promedio) ? 0 : promedio;
  }

  // Métodos para alertas

  getEgresosProximosVencer(): Egreso[] {
    const hoy = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoy.getDate() + 7);
    
    return this.egresos.filter(egreso => {
      const fechaEgreso = new Date(egreso.fecha);
      return fechaEgreso >= hoy && fechaEgreso <= proximaSemana && egreso.estado === 'pendiente';
    });
  }

  // Método para actualizar estado de egreso
  async actualizarEstadoEgreso(egresoId: string, nuevoEstado: 'pendiente' | 'pagado' | 'vencido') {
    try {
      await firstValueFrom(this.egresosService.actualizarEgreso(egresoId, { estado: nuevoEstado }));

      // Recargar datos para reflejar el cambio
      this.cargarDatosMensuales();
    } catch (error) {

    }
  }

  // Métodos para manejar deudas
  esCategoriaDeuda(categoria: any): boolean {
    // Usamos el nombre del tipo de egreso para determinar si es una deuda
    const tipoNombre = categoria.tipo_egreso_nombre?.toLowerCase() || '';
    const esDeuda = tipoNombre.includes('deuda') || 
                   tipoNombre.includes('préstamo') || 
                   tipoNombre.includes('prestamo') ||
                   tipoNombre.includes('crédito') ||
                   tipoNombre.includes('credito') ||
                   tipoNombre.includes('financiación') ||
                   tipoNombre.includes('financiacion');

    return esDeuda;
  }

  getProgresoDeuda(categoria: any): number {
    // Para deudas programadas, calculamos el progreso basado en tiempo
    if (this.esCategoriaDeuda(categoria)) {
      const egresosDeuda = this.egresos.filter(egreso => 
        egreso.categoria_nombre === categoria.categoria_nombre && 
        egreso.esPeriodico && 
        egreso.fechaInicio && 
        egreso.fechaFin
      );
      
      if (egresosDeuda.length > 0) {
        // Tomar el primer egreso como referencia (todos deberían tener las mismas fechas)
        const egresoReferencia = egresosDeuda[0];
        const fechaInicio = new Date(egresoReferencia.fechaInicio!);
        const fechaFin = new Date(egresoReferencia.fechaFin!);
        const fechaActual = new Date();
        
        // Calcular meses totales programados
        const mesesTotales = this.calcularMesesEntreFechas(fechaInicio, fechaFin);
        const mesesTranscurridos = this.calcularMesesEntreFechas(fechaInicio, fechaActual);

        if (mesesTotales === 0) return 0;
        return Math.min(mesesTranscurridos / mesesTotales, 1);
      }
    }
    
    // Para todas las categorías (deudas y no deudas), usar cálculo por monto
    const total = parseFloat(categoria.monto_total || 0);
    const pagado = parseFloat(categoria.monto_pagado || 0);
    if (total === 0) return 0;
    return Math.min(pagado / total, 1);
  }

  getColorProgresoDeuda(categoria: any): string {
    const progreso = this.getProgresoDeuda(categoria);
    
    if (progreso === 1) return 'success';
    if (progreso >= 0.7) return 'warning';
    return 'danger';
  }

  getTextoProgresoDeuda(categoria: any): string {
    // Para deudas programadas, mostrar información basada en tiempo
    if (this.esCategoriaDeuda(categoria)) {
      const egresosDeuda = this.egresos.filter(egreso => 
        egreso.categoria_nombre === categoria.categoria_nombre && 
        egreso.esPeriodico && 
        egreso.fechaInicio && 
        egreso.fechaFin
      );
      
      if (egresosDeuda.length > 0) {
        // Calcular información basada en tiempo
        const egresoReferencia = egresosDeuda[0];
        const fechaInicio = new Date(egresoReferencia.fechaInicio!);
        const fechaFin = new Date(egresoReferencia.fechaFin!);
        const fechaActual = new Date();
        
        const mesesTotales = this.calcularMesesEntreFechas(fechaInicio, fechaFin);
        const mesesTranscurridos = Math.min(this.calcularMesesEntreFechas(fechaInicio, fechaActual), mesesTotales);
        const mesesPendientes = Math.max(mesesTotales - mesesTranscurridos, 0);
        
        return `Meses: ${mesesTranscurridos}/${mesesTotales} | Pendientes: ${mesesPendientes}`;
      }
    }
    
    // Para todas las categorías (deudas y no deudas), usar cálculo por monto
    const total = parseFloat(categoria.monto_total || 0);
    const pagado = parseFloat(categoria.monto_pagado || 0);
    const pendiente = total - pagado;
    return `Pagado: ${this.formatearMoneda(pagado)} | Pendiente: ${this.formatearMoneda(pendiente)}`;
  }

  // Método para calcular meses entre dos fechas
  calcularMesesEntreFechas(fechaInicio: Date, fechaFin: Date): number {
    const añoInicio = fechaInicio.getFullYear();
    const mesInicio = fechaInicio.getMonth();
    const añoFin = fechaFin.getFullYear();
    const mesFin = fechaFin.getMonth();
    
    return (añoFin - añoInicio) * 12 + (mesFin - mesInicio) + 1;
  }

  // Método para formatear moneda de manera consistente
  formatearMoneda(monto: number): string {
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  }
}
