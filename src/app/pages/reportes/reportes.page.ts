import { Component, OnInit } from '@angular/core';
import { EgresosService } from '../../services/egresos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false
})
export class ReportesPage implements OnInit {
  // Datos del reporte
  reporteAnual: any = null;
  cargando = false;
  
  // Configuración de visualización
  tipoVisualizacion: 'tipo' | 'categoria' = 'tipo';
  anioSeleccionado = new Date().getFullYear();
  
  // Opciones de años disponibles
  aniosDisponibles: number[] = [];
  
  // Estados de acordeones
  detallesExpandido = true;
  mesesExpandido = true;

  constructor(private egresosService: EgresosService) {
    this.generarAniosDisponibles();
  }

  ngOnInit() {
    this.cargarReporteAnual();
  }

  // Generar lista de años disponibles (últimos 5 años)
  generarAniosDisponibles() {
    const anioActual = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.aniosDisponibles.push(anioActual - i);
    }
  }

  // Cargar reporte anual
  async cargarReporteAnual() {
    this.cargando = true;
    try {
      console.log('Cargando reporte anual para año:', this.anioSeleccionado);
      
      // Obtener usuario actual (asumiendo ID 1 por ahora)
      const usuarioId = '1';
      
      const egresos = await firstValueFrom(
        this.egresosService.getReporteAnual(usuarioId, this.anioSeleccionado)
      );

      console.log('Egresos recibidos:', egresos);
      this.procesarDatosReporte(egresos);
      
    } catch (error) {
      console.error('Error cargando reporte anual:', error);
    } finally {
      this.cargando = false;
    }
  }

  // Procesar datos para el reporte
  procesarDatosReporte(egresos: any[]) {
    const gastosPorTipo: { [key: string]: number } = {};
    const gastosPorCategoria: { [key: string]: number } = {};
    const gastosPorMes: { [key: string]: number } = {};
    
    let totalGastado = 0;

    egresos.forEach(egreso => {
      const monto = parseFloat(egreso.monto) || 0;
      totalGastado += monto;

      // Agrupar por tipo de egreso
      const tipo = egreso.tipo_egreso_nombre || 'Sin tipo';
      gastosPorTipo[tipo] = (gastosPorTipo[tipo] || 0) + monto;

      // Agrupar por categoría
      const categoria = egreso.categoria_nombre || 'Sin categoría';
      gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto;

      // Agrupar por mes
      const fecha = new Date(egreso.fecha);
      const mes = fecha.toLocaleString('es', { month: 'long' });
      gastosPorMes[mes] = (gastosPorMes[mes] || 0) + monto;
    });

    this.reporteAnual = {
      anio: this.anioSeleccionado,
      totalGastado,
      gastosPorTipo,
      gastosPorCategoria,
      gastosPorMes
    };

    console.log('Reporte procesado:', this.reporteAnual);
  }

  // Cambiar tipo de visualización
  cambiarTipoVisualizacion(tipo: any) {
    console.log('Cambiando tipo de visualización a:', tipo);
    this.tipoVisualizacion = tipo as 'tipo' | 'categoria';
  }

  // Cambiar año
  cambiarAnio(anio: any) {
    this.anioSeleccionado = anio as number;
    this.cargarReporteAnual();
  }

  // Formatear moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  // Obtener porcentaje
  obtenerPorcentaje(valor: number, total: number): number {
    return total > 0 ? (valor / total) * 100 : 0;
  }

  // Obtener datos ordenados por valor
  obtenerDatosOrdenados(datos: { [key: string]: number }) {
    return Object.entries(datos)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor);
  }

  // Métodos para controlar acordeones
  toggleDetalles() {
    this.detallesExpandido = !this.detallesExpandido;
  }

  toggleMeses() {
    this.mesesExpandido = !this.mesesExpandido;
  }

  // Métodos auxiliares para el template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getObjectValues(obj: any): number[] {
    return Object.values(obj);
  }
}
