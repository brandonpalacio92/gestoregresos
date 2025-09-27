import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { EgresosService } from '../../services/egresos.service';
import { firstValueFrom } from 'rxjs';
// import { Chart, registerables } from 'chart.js'; // Deshabilitado temporalmente

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false
})
export class ReportesPage implements OnInit, AfterViewInit {
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
  
  // Configuración de gráficas
  tipoGrafica: 'barras' = 'barras';
  graficaVisible = true;
  
  // Variables para mostrar datos de gráfica
  datosGrafica: any[] = [];
  mostrarDatosGrafica = false;
  
  // Referencias a elementos del DOM
  @ViewChild('graficaCanvas', { static: false }) graficaCanvas!: ElementRef<HTMLCanvasElement>;
  
  // Instancia de Chart.js (deshabilitado temporalmente)
  grafica: any = null;

  constructor(private egresosService: EgresosService) {
    this.generarAniosDisponibles();
    // Registrar todos los componentes de Chart.js (deshabilitado temporalmente)
    // Chart.register(...registerables);
  }

  ngOnInit() {
    this.cargarReporteAnual();
  }

  ngAfterViewInit() {
    // La gráfica se creará cuando se carguen los datos
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
      // Obtener usuario actual (asumiendo ID 1 por ahora)
      const usuarioId = '1';
      
      const egresos = await firstValueFrom(
        this.egresosService.getReporteAnual(usuarioId, this.anioSeleccionado)
      );
      this.procesarDatosReporte(egresos);
      
    } catch (error) {
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
    // Mostrar visualización automáticamente
    setTimeout(() => {
      this.crearGrafica();
    }, 100);
  }

  // Cambiar tipo de visualización
  cambiarTipoVisualizacion(tipo: any) {
    this.tipoVisualizacion = tipo as 'tipo' | 'categoria';
    this.crearGrafica();
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

  // Métodos para manejar gráficas
  cambiarTipoGrafica(tipo: any) {
    this.tipoGrafica = tipo as 'barras';
    this.crearGrafica();
  }

  toggleGrafica() {
    this.graficaVisible = !this.graficaVisible;
    if (this.graficaVisible) {
      setTimeout(() => {
        this.crearGrafica();
      }, 100);
    } else {
      this.destruirGrafica();
    }
  }

  crearGrafica() {
    try {
      if (!this.reporteAnual) {
        return;
      }

      // Obtener datos según el tipo de visualización
      const datos = this.tipoVisualizacion === 'tipo' 
        ? this.reporteAnual.gastosPorTipo 
        : this.reporteAnual.gastosPorCategoria;

      if (!datos || typeof datos !== 'object') {
        return;
      }

      const datosOrdenados = this.obtenerDatosOrdenados(datos);
      
      if (datosOrdenados.length === 0) {
        return;
      }
      // Mostrar datos directamente en la interfaz
      this.datosGrafica = datosOrdenados;
      this.mostrarDatosGrafica = true;
      
    } catch (error) {
    }
  }

  // Métodos de Chart.js deshabilitados temporalmente
  /*
  crearGraficaBarras(ctx: CanvasRenderingContext2D, configuracion: any) {
    try {
      this.grafica = new Chart(ctx, {
      type: 'bar',
      data: configuracion,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Gastos por ${this.tipoVisualizacion === 'tipo' ? 'Tipo de Egreso' : 'Categoría'} - ${this.anioSeleccionado}`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const valor = context.parsed.y;
                const porcentaje = this.obtenerPorcentaje(valor, this.reporteAnual.totalGastado);
                return `${this.formatearMoneda(valor)} (${porcentaje.toFixed(1)}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatearMoneda(Number(value))
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          }
        }
      }
    });
    } catch (error) {
    }
  }
  */

  /*
  crearGraficaCircular(ctx: CanvasRenderingContext2D, configuracion: any) {
    try {
      this.grafica = new Chart(ctx, {
      type: 'doughnut',
      data: configuracion,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Distribución por ${this.tipoVisualizacion === 'tipo' ? 'Tipo de Egreso' : 'Categoría'} - ${this.anioSeleccionado}`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const valor = context.parsed;
                const porcentaje = this.obtenerPorcentaje(valor, this.reporteAnual.totalGastado);
                return `${context.label}: ${this.formatearMoneda(valor)} (${porcentaje.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
    } catch (error) {
    }
  }

  crearGraficaLineas(ctx: CanvasRenderingContext2D, configuracion: any) {
    try {
      // Para líneas, usamos los datos por mes
      const datosMeses = this.obtenerDatosOrdenados(this.reporteAnual.gastosPorMes);
      const mesesOrdenados = this.ordenarMeses(datosMeses);

      this.grafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: mesesOrdenados.map(item => item.nombre),
        datasets: [{
          label: 'Gastos Mensuales',
          data: mesesOrdenados.map(item => item.valor),
          borderColor: '#3880ff',
          backgroundColor: 'rgba(56, 128, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3880ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Evolución de Gastos por Mes - ${this.anioSeleccionado}`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const valor = context.parsed.y;
                return `${this.formatearMoneda(valor)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatearMoneda(Number(value))
            }
          }
        }
      }
    });
    } catch (error) {
    }
  }
  */

  destruirGrafica() {
    if (this.grafica) {
      this.grafica.destroy();
      this.grafica = null;
    }
  }

  generarColores(cantidad: number, opacidad: number = 1): string[] {
    const colores = [
      `rgba(56, 128, 255, ${opacidad})`,    // Azul
      `rgba(16, 185, 129, ${opacidad})`,    // Verde
      `rgba(245, 101, 101, ${opacidad})`,   // Rojo
      `rgba(251, 191, 36, ${opacidad})`,    // Amarillo
      `rgba(139, 92, 246, ${opacidad})`,    // Púrpura
      `rgba(236, 72, 153, ${opacidad})`,    // Rosa
      `rgba(6, 182, 212, ${opacidad})`,     // Cian
      `rgba(34, 197, 94, ${opacidad})`,     // Verde claro
      `rgba(251, 146, 60, ${opacidad})`,    // Naranja
      `rgba(168, 85, 247, ${opacidad})`     // Violeta
    ];

    const coloresResultado = [];
    for (let i = 0; i < cantidad; i++) {
      coloresResultado.push(colores[i % colores.length]);
    }
    return coloresResultado;
  }

  ordenarMeses(datosMeses: any[]): any[] {
    const ordenMeses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return datosMeses.sort((a, b) => {
      const indiceA = ordenMeses.indexOf(a.nombre.toLowerCase());
      const indiceB = ordenMeses.indexOf(b.nombre.toLowerCase());
      return indiceA - indiceB;
    });
  }

  // Método para verificar si hay datos para mostrar en la gráfica
  tieneDatosParaGrafica(): boolean {
    if (!this.reporteAnual) {
      return false;
    }

    const datos = this.tipoVisualizacion === 'tipo' 
      ? this.reporteAnual.gastosPorTipo 
      : this.reporteAnual.gastosPorCategoria;

    return Object.keys(datos).length > 0;
  }

  // Obtener el título de la gráfica
  obtenerTituloGrafica(): string {
    const tipoVisualizacion = this.tipoVisualizacion === 'tipo' ? 'Tipo de Egreso' : 'Categoría';
    return `Gráfica de Barras - ${tipoVisualizacion}`;
  }

  // Obtener el color para cada elemento
  obtenerColorElemento(index: number): string {
    const colores = [
      '#3880ff', '#16b981', '#f56565', '#fbbf24', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e', 
      '#fb923c', '#a855f7'
    ];
    return colores[index % colores.length];
  }
}
