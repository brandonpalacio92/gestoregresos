module.exports = (sql) => {
    const express = require('express');
    const router = express.Router();
  
    // Función para generar fechas según la frecuencia
    function generarFechasPorFrecuencia(fechaInicio, fechaFin, frecuencia) {
      const fechas = [];
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      
      let fechaActual = new Date(inicio);
      
      while (fechaActual <= fin) {
        fechas.push(fechaActual.toISOString().split('T')[0]); // Formato YYYY-MM-DD
        
        // Incrementar según la frecuencia
        switch (frecuencia) {
          case 'diario':
            fechaActual.setDate(fechaActual.getDate() + 1);
            break;
          case 'semanal':
            fechaActual.setDate(fechaActual.getDate() + 7);
            break;
          case 'quincenal':
            fechaActual.setDate(fechaActual.getDate() + 15);
            break;
          case 'mensual':
            fechaActual.setMonth(fechaActual.getMonth() + 1);
            break;
          case 'bimestral':
            fechaActual.setMonth(fechaActual.getMonth() + 2);
            break;
          case 'trimestral':
            fechaActual.setMonth(fechaActual.getMonth() + 3);
            break;
          case 'semestral':
            fechaActual.setMonth(fechaActual.getMonth() + 6);
            break;
          case 'anual':
            fechaActual.setFullYear(fechaActual.getFullYear() + 1);
            break;
          default:
            // Si no se reconoce la frecuencia, solo agregar la fecha de inicio
            fechas.push(fechaActual.toISOString().split('T')[0]);
            break;
        }
      }
      
      return fechas;
    }
  
    // Ruta para obtener tipos de egreso
    router.get('/tipos-egreso', async (req, res) => {
      try {
        const result = await sql`SELECT * FROM tipo_egreso`;
        res.json(result);
      } catch (error) {
        console.error('Error al obtener tipos de egreso:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    });

      // Ruta para obtener tipos de egreso con sus categorías
  router.get('/tipos-egreso/con-categorias', async (req, res) => {
    try {
      const tipos = await sql`SELECT * FROM tipo_egreso`;
      const categorias = await sql`SELECT * FROM categorias`;

      const tiposConCategorias = tipos.map(tipo => ({
        ...tipo,
        categorias: categorias.filter(cat => cat.tipo_egreso_id === tipo.id)
      }));

      res.json(tiposConCategorias);
    } catch (error) {
      console.error('Error al obtener tipos con categorías:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Ruta para obtener egresos por mes
  router.get('/mes', async (req, res) => {
    try {
      const { usuarioId, mes, año } = req.query;
      
      console.log(`📅 Obteniendo egresos del mes ${mes}/${año} para usuario: ${usuarioId}`);
      
      if (!usuarioId || !mes || !año) {
        return res.status(400).json({ 
          success: false,
          error: 'Faltan parámetros requeridos: usuarioId, mes, año' 
        });
      }

      // Calcular fechas del mes
      const fechaInicio = new Date(parseInt(año), parseInt(mes) - 1, 1);
      const fechaFin = new Date(parseInt(año), parseInt(mes), 0);
      
      console.log(`📅 Rango de fechas: ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`);

      const egresos = await sql`
        SELECT e.*, c.nombre as categoria_nombre, t.nombre as tipo_egreso_nombre
        FROM egresos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        LEFT JOIN tipo_egreso t ON c.tipo_egreso_id = t.id
        WHERE e.usuario_id = ${parseInt(usuarioId)}
          AND e.fecha >= ${fechaInicio}
          AND e.fecha <= ${fechaFin}
          AND e.estado != 'parcializado'  -- Excluir registros parcializados
        ORDER BY e.fecha DESC
      `;

      console.log(`📊 Encontrados ${egresos.length} egresos del mes ${mes}/${año}`);
      
      // Log detallado de los egresos encontrados
      if (egresos.length > 0) {
        console.log('📊 Primeros 3 egresos encontrados:', egresos.slice(0, 3).map(e => ({
          id: e.id,
          descripcion: e.descripcion,
          monto: e.monto,
          estado: e.estado,
          fecha: e.fecha
        })));
        
        // Contar por estado
        const estados = egresos.reduce((acc, e) => {
          acc[e.estado] = (acc[e.estado] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Estados de egresos:', estados);
      }
      
      res.json(egresos);
    } catch (error) {
      console.error('Error al obtener egresos por mes:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  });

  // Ruta para obtener estadísticas por categoría del mes
  router.get('/estadisticas-mes', async (req, res) => {
    try {
      const { usuarioId, mes, año } = req.query;
      
      console.log(`📊 Obteniendo estadísticas del mes ${mes}/${año} para usuario: ${usuarioId}`);
      
      if (!usuarioId || !mes || !año) {
        return res.status(400).json({ 
          success: false,
          error: 'Faltan parámetros requeridos: usuarioId, mes, año' 
        });
      }

      // Calcular fechas del mes
      const fechaInicio = new Date(parseInt(año), parseInt(mes) - 1, 1);
      const fechaFin = new Date(parseInt(año), parseInt(mes), 0);
      
      console.log(`📅 Rango de fechas: ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`);

      // Obtener estadísticas por categoría
      console.log('🔍 Ejecutando consulta de estadísticas...');
      
      const estadisticas = await sql`
        SELECT 
          c.id as categoria_id,
          c.nombre as categoria_nombre,
          '#3B82F6' as categoria_color,
          'receipt-outline' as categoria_icono,
          t.id as tipo_egreso_id,
          t.nombre as tipo_egreso_nombre,
          COUNT(e.id) as cantidad_egresos,
          COALESCE(SUM(e.monto), 0) as monto_total,
          COALESCE(AVG(e.monto), 0) as monto_promedio,
          COUNT(CASE WHEN e.estado = 'pagado' THEN 1 END) as cantidad_pagados,
          COUNT(CASE WHEN e.estado = 'pendiente' THEN 1 END) as cantidad_pendientes,
          COUNT(CASE WHEN e.estado = 'vencido' THEN 1 END) as cantidad_vencidos,
          COALESCE(SUM(CASE WHEN e.estado = 'pagado' THEN e.monto ELSE 0 END), 0) as monto_pagado,
          COALESCE(SUM(CASE WHEN e.estado = 'pendiente' THEN e.monto ELSE 0 END), 0) as monto_pendiente,
          COALESCE(SUM(CASE WHEN e.estado = 'vencido' THEN e.monto ELSE 0 END), 0) as monto_vencido
        FROM categorias c
        LEFT JOIN egresos e ON c.id = e.categoria_id 
          AND e.usuario_id = ${parseInt(usuarioId)}
          AND e.fecha >= ${fechaInicio}
          AND e.fecha <= ${fechaFin}
          AND e.estado != 'parcializado'  -- Excluir registros parcializados
        LEFT JOIN tipo_egreso t ON c.tipo_egreso_id = t.id
        GROUP BY c.id, c.nombre, t.id, t.nombre
        ORDER BY monto_total DESC
      `;
      
      console.log('✅ Consulta de estadísticas ejecutada exitosamente');

      console.log(`📊 Encontradas ${estadisticas.length} categorías con egresos del mes ${mes}/${año}`);
      
      // Log detallado de las estadísticas
      if (estadisticas.length > 0) {
        console.log('📊 Primeras 3 categorías con estadísticas:', estadisticas.slice(0, 3).map(c => ({
          categoria_nombre: c.categoria_nombre,
          monto_total: c.monto_total,
          monto_pagado: c.monto_pagado,
          monto_pendiente: c.monto_pendiente,
          monto_vencido: c.monto_vencido
        })));
        
        // Sumar totales
        const totales = estadisticas.reduce((acc, c) => {
          acc.total += parseFloat(c.monto_total || 0);
          acc.pagado += parseFloat(c.monto_pagado || 0);
          acc.pendiente += parseFloat(c.monto_pendiente || 0);
          acc.vencido += parseFloat(c.monto_vencido || 0);
          return acc;
        }, { total: 0, pagado: 0, pendiente: 0, vencido: 0 });
        console.log('📊 Totales calculados:', totales);
      }
      
      res.json(estadisticas);
    } catch (error) {
      console.error('❌ Error al obtener estadísticas del mes:', error);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ Parámetros recibidos:', { usuarioId: req.query.usuarioId, mes: req.query.mes, año: req.query.año });
      
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message,
        stack: error.stack
      });
    }
  });

  // Ruta para obtener egresos de un usuario con filtros
  router.get('/', async (req, res) => {
    try {
      const { usuarioId, estado, tipoEgresoId, periodo, mes, año } = req.query;
      
      if (!usuarioId) {
        return res.status(400).json({ 
          error: 'usuarioId es requerido' 
        });
      }

      console.log('📥 Obteniendo egresos para usuario:', usuarioId, 'con filtros:', { estado, tipoEgresoId, periodo, mes, año });
      console.log('🔍 Tipos de datos:', { 
        estado: typeof estado, 
        tipoEgresoId: typeof tipoEgresoId, 
        periodo: typeof periodo,
        mes: typeof mes,
        año: typeof año
      });
      console.log('🔍 Valores específicos:', {
        estado: estado,
        tipoEgresoId: tipoEgresoId,
        periodo: periodo,
        mes: mes,
        año: año,
        estadoEsTodos: estado === 'todos',
        tipoEgresoIdEsTodos: tipoEgresoId === 'todos',
        periodoEsTodos: periodo === 'todos',
        esPersonalizado: periodo === 'personalizado'
      });
      
      // Log específico para estado vencido
      if (estado === 'vencido') {
        console.log('🔍 Filtro de estado VENCIDO detectado');
      }
      
      // Construir la consulta con parámetros seguros
      let egresos;
      
      console.log('🔍 Evaluando condiciones de filtros:', {
        estado: estado,
        tipoEgresoId: tipoEgresoId,
        periodo: periodo,
        mes: mes,
        año: año,
        condicion1: estado && estado !== 'todos' && tipoEgresoId && tipoEgresoId !== 'todos' && periodo && periodo !== 'todos',
        condicion2: estado && estado !== 'todos' && tipoEgresoId && tipoEgresoId !== 'todos',
        condicion3: estado && estado !== 'todos' && periodo && periodo !== 'todos',
        condicion4: tipoEgresoId && tipoEgresoId !== 'todos' && periodo && periodo !== 'todos',
        condicion5: tipoEgresoId && tipoEgresoId !== 'todos',
        condicion6: estado && estado !== 'todos',
        condicion7: periodo && periodo !== 'todos'
      });
      
      if (estado && estado !== 'todos' && tipoEgresoId && tipoEgresoId !== 'todos' && periodo && periodo !== 'todos') {
        console.log('🎯 Ejecutando: Todos los filtros');
        // Todos los filtros
        const hoy = new Date();
        let fechaInicio, fechaFin;
        
        if (periodo === 'vencidos') {
          fechaInicio = null;
          fechaFin = hoy.toISOString().split('T')[0];
        } else if (periodo === 'proximos') {
          fechaInicio = hoy.toISOString().split('T')[0];
          const proximaSemana = new Date();
          proximaSemana.setDate(hoy.getDate() + 7);
          fechaFin = proximaSemana.toISOString().split('T')[0];
        } else if (periodo === 'mes') {
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        } else if (periodo === 'personalizado' && mes && año) {
          // Filtro personalizado por mes y año específicos
          const inicioMes = new Date(parseInt(año), parseInt(mes) - 1, 1);
          const finMes = new Date(parseInt(año), parseInt(mes), 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        }
        
        if (periodo === 'vencidos') {
          // Para período vencidos: fechas que ya pasaron Y que no estén pagados
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND e.estado = ${estado}
              AND c.tipo_egreso_id = ${parseInt(tipoEgresoId)}
              AND e.fecha < ${fechaFin}
              AND e.estado != 'pagado'
            ORDER BY e.fecha DESC
          `;
        } else {
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND e.estado = ${estado}
              AND c.tipo_egreso_id = ${parseInt(tipoEgresoId)}
              AND e.fecha >= ${fechaInicio}
              AND e.fecha <= ${fechaFin}
            ORDER BY e.fecha DESC
          `;
        }
      } else if (estado && estado !== 'todos' && tipoEgresoId && tipoEgresoId !== 'todos') {
        console.log('🎯 Ejecutando: Estado y tipo de egreso');
        // Estado y tipo de egreso
        egresos = await sql`
          SELECT e.*, c.nombre as categoria_nombre
          FROM egresos e
          LEFT JOIN categorias c ON e.categoria_id = c.id
          WHERE e.usuario_id = ${parseInt(usuarioId)}
            AND e.estado = ${estado}
            AND c.tipo_egreso_id = ${parseInt(tipoEgresoId)}
          ORDER BY e.fecha DESC
        `;
      } else if (estado && estado !== 'todos' && periodo && periodo !== 'todos') {
        console.log('🎯 Ejecutando: Estado y período');
        // Estado y período
        const hoy = new Date();
        let fechaInicio, fechaFin;
        
        if (periodo === 'vencidos') {
          fechaInicio = null;
          fechaFin = hoy.toISOString().split('T')[0];
        } else if (periodo === 'proximos') {
          fechaInicio = hoy.toISOString().split('T')[0];
          const proximaSemana = new Date();
          proximaSemana.setDate(hoy.getDate() + 7);
          fechaFin = proximaSemana.toISOString().split('T')[0];
        } else if (periodo === 'mes') {
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        } else if (periodo === 'personalizado' && mes && año) {
          // Filtro personalizado por mes y año específicos
          const inicioMes = new Date(parseInt(año), parseInt(mes) - 1, 1);
          const finMes = new Date(parseInt(año), parseInt(mes), 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        }
        
        if (periodo === 'vencidos') {
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND e.estado = ${estado}
              AND e.fecha < ${fechaFin}
              AND e.estado != 'pagado'
            ORDER BY e.fecha DESC
          `;
        } else {
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND e.estado = ${estado}
              AND e.fecha >= ${fechaInicio}
              AND e.fecha <= ${fechaFin}
            ORDER BY e.fecha DESC
          `;
        }
      } else if (tipoEgresoId && tipoEgresoId !== 'todos' && periodo && periodo !== 'todos') {
        console.log('🎯 Ejecutando: Tipo de egreso y período');
        // Tipo de egreso y período
        const hoy = new Date();
        let fechaInicio, fechaFin;
        
        if (periodo === 'vencidos') {
          fechaInicio = null;
          fechaFin = hoy.toISOString().split('T')[0];
        } else if (periodo === 'proximos') {
          fechaInicio = hoy.toISOString().split('T')[0];
          const proximaSemana = new Date();
          proximaSemana.setDate(hoy.getDate() + 7);
          fechaFin = proximaSemana.toISOString().split('T')[0];
        } else if (periodo === 'mes') {
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        } else if (periodo === 'personalizado' && mes && año) {
          // Filtro personalizado por mes y año específicos
          const inicioMes = new Date(parseInt(año), parseInt(mes) - 1, 1);
          const finMes = new Date(parseInt(año), parseInt(mes), 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        }
        
        if (periodo === 'vencidos') {
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND c.tipo_egreso_id = ${parseInt(tipoEgresoId)}
              AND e.fecha < ${fechaFin}
              AND e.estado != 'pagado'
            ORDER BY e.fecha DESC
          `;
        } else {
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND c.tipo_egreso_id = ${parseInt(tipoEgresoId)}
              AND e.fecha >= ${fechaInicio}
              AND e.fecha <= ${fechaFin}
            ORDER BY e.fecha DESC
          `;
        }
      } else if (estado && estado !== 'todos') {
        console.log('🎯 Ejecutando: Solo estado');
        // Solo estado
        egresos = await sql`
          SELECT e.*, c.nombre as categoria_nombre
          FROM egresos e
          LEFT JOIN categorias c ON e.categoria_id = c.id
          WHERE e.usuario_id = ${parseInt(usuarioId)}
            AND e.estado = ${estado}
          ORDER BY e.fecha DESC
        `;
      } else if (tipoEgresoId && tipoEgresoId !== 'todos') {
        console.log('🎯 Ejecutando: Solo tipo de egreso');
        // Solo tipo de egreso
        egresos = await sql`
          SELECT e.*, c.nombre as categoria_nombre
          FROM egresos e
          LEFT JOIN categorias c ON e.categoria_id = c.id
          WHERE e.usuario_id = ${parseInt(usuarioId)}
            AND c.tipo_egreso_id = ${parseInt(tipoEgresoId)}
          ORDER BY e.fecha DESC
        `;
      } else if (periodo && periodo !== 'todos') {
        console.log('🎯 Ejecutando: Solo período');
        // Solo período
        const hoy = new Date();
        let fechaInicio, fechaFin;
        
        if (periodo === 'vencidos') {
          fechaInicio = null;
          fechaFin = hoy.toISOString().split('T')[0];
        } else if (periodo === 'proximos') {
          fechaInicio = hoy.toISOString().split('T')[0];
          const proximaSemana = new Date();
          proximaSemana.setDate(hoy.getDate() + 7);
          fechaFin = proximaSemana.toISOString().split('T')[0];
        } else if (periodo === 'mes') {
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        } else if (periodo === 'personalizado' && mes && año) {
          // Filtro personalizado por mes y año específicos
          const inicioMes = new Date(parseInt(año), parseInt(mes) - 1, 1);
          const finMes = new Date(parseInt(año), parseInt(mes), 0);
          fechaInicio = inicioMes.toISOString().split('T')[0];
          fechaFin = finMes.toISOString().split('T')[0];
        }
        
        if (periodo === 'vencidos') {
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND e.fecha < ${fechaFin}
              AND e.estado != 'pagado'
            ORDER BY e.fecha DESC
          `;
        } else {
          egresos = await sql`
            SELECT e.*, c.nombre as categoria_nombre
            FROM egresos e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            WHERE e.usuario_id = ${parseInt(usuarioId)}
              AND e.fecha >= ${fechaInicio}
              AND e.fecha <= ${fechaFin}
            ORDER BY e.fecha DESC
          `;
        }
      } else {
        console.log('🎯 Ejecutando: Sin filtros (todos los egresos)');
        // Sin filtros - todos los egresos
        egresos = await sql`
          SELECT e.*, c.nombre as categoria_nombre
          FROM egresos e
          LEFT JOIN categorias c ON e.categoria_id = c.id
          WHERE e.usuario_id = ${parseInt(usuarioId)}
          ORDER BY e.fecha DESC
        `;
      }

      console.log(`📊 Encontrados ${egresos.length} egresos con filtros aplicados`);
      console.log('📋 Primeros 3 egresos encontrados:', egresos.slice(0, 3).map(e => ({
        id: e.id,
        descripcion: e.descripcion,
        categoria_id: e.categoria_id,
        categoria_nombre: e.categoria_nombre,
        estado: e.estado
      })));
      
      res.json(egresos);
    } catch (error) {
      console.error('Error al obtener egresos:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor', 
        message: error.message 
      });
    }
  });

  // Ruta para registrar un nuevo egreso
  router.post('/', async (req, res) => {
    try {
      console.log('📥 Datos recibidos:', JSON.stringify(req.body, null, 2));
      
      const { 
        descripcion, 
        monto, 
        fecha, 
        categoriaId, 
        esPeriodico, 
        frecuencia, 
        fechaInicio, 
        fechaFin, 
        usuarioId, 
        estado, 
        notas 
      } = req.body;

      // Validar datos requeridos
      if (!descripcion || !monto || !fecha || !categoriaId || !usuarioId) {
        console.log('❌ Faltan datos requeridos:', {
          descripcion: !!descripcion,
          monto: !!monto,
          fecha: !!fecha,
          categoriaId: !!categoriaId,
          usuarioId: !!usuarioId
        });
        return res.status(400).json({ 
          error: 'Faltan datos requeridos: descripcion, monto, fecha, categoriaId, usuarioId' 
        });
      }

      // Convertir usuarioId a número si viene como string
      const usuarioIdNum = parseInt(usuarioId);
      if (isNaN(usuarioIdNum)) {
        console.log('❌ usuarioId no es un número válido:', usuarioId);
        return res.status(400).json({ 
          error: 'usuarioId debe ser un número válido' 
        });
      }

      // Generar fechas según la frecuencia
      let fechasParaInsertar = [];
      
      if (esPeriodico && frecuencia && fechaInicio && fechaFin) {
        fechasParaInsertar = generarFechasPorFrecuencia(fechaInicio, fechaFin, frecuencia);
        console.log(`📅 Generando ${fechasParaInsertar.length} registros para frecuencia: ${frecuencia}`);
      } else {
        // Si no es periódico, solo usar la fecha principal
        fechasParaInsertar = [fecha];
      }

      // Insertar múltiples registros
      const resultados = [];
      for (const fechaRegistro of fechasParaInsertar) {
        console.log('💾 Insertando egreso para fecha:', fechaRegistro);
        
        const result = await sql`
          INSERT INTO egresos (
            descripcion, 
            monto, 
            fecha, 
            categoria_id, 
            es_periodico, 
            frecuencia, 
            usuario_id, 
            estado, 
            notas
          ) VALUES (
            ${descripcion}, 
            ${parseFloat(monto)}, 
            ${fechaRegistro}, 
            ${parseInt(categoriaId)}, 
            ${esPeriodico || false}, 
            ${frecuencia || null}, 
            ${usuarioIdNum}, 
            ${estado || 'pendiente'}, 
            ${notas || null}
          ) RETURNING *
        `;
        
        resultados.push(result[0]);
      }

      res.status(201).json({
        success: true,
        message: `Se crearon ${resultados.length} registros de egreso exitosamente`,
        data: resultados,
        cantidad: resultados.length
      });
    } catch (error) {
      console.error('Error al registrar egreso:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  });

  // Ruta para actualizar un egreso
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, descripcion, monto, fecha, categoriaId, notas } = req.body;
      
      console.log(`🔄 Actualizando egreso ${id} con datos:`, req.body);
      
      // Validar que el egreso existe
      const egresoExistente = await sql`
        SELECT id, usuario_id FROM egresos WHERE id = ${parseInt(id)}
      `;
      
      if (egresoExistente.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Egreso no encontrado' 
        });
      }
      
      // Construir la consulta de actualización usando template literals
      let resultado;
      
      if (estado !== undefined && descripcion === undefined && monto === undefined && fecha === undefined && categoriaId === undefined && notas === undefined) {
        // Solo actualizar estado
        resultado = await sql`
          UPDATE egresos 
          SET estado = ${estado}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
      } else if (descripcion !== undefined && estado === undefined && monto === undefined && fecha === undefined && categoriaId === undefined && notas === undefined) {
        // Solo actualizar descripción
        resultado = await sql`
          UPDATE egresos 
          SET descripcion = ${descripcion}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
      } else if (monto !== undefined && estado === undefined && descripcion === undefined && fecha === undefined && categoriaId === undefined && notas === undefined) {
        // Solo actualizar monto
        resultado = await sql`
          UPDATE egresos 
          SET monto = ${parseFloat(monto)}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
      } else if (fecha !== undefined && estado === undefined && descripcion === undefined && monto === undefined && categoriaId === undefined && notas === undefined) {
        // Solo actualizar fecha
        resultado = await sql`
          UPDATE egresos 
          SET fecha = ${new Date(fecha)}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
      } else if (categoriaId !== undefined && estado === undefined && descripcion === undefined && monto === undefined && fecha === undefined && notas === undefined) {
        // Solo actualizar categoría
        resultado = await sql`
          UPDATE egresos 
          SET categoria_id = ${parseInt(categoriaId)}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
      } else if (notas !== undefined && estado === undefined && descripcion === undefined && monto === undefined && fecha === undefined && categoriaId === undefined) {
        // Solo actualizar notas
        resultado = await sql`
          UPDATE egresos 
          SET notas = ${notas}
          WHERE id = ${parseInt(id)}
          RETURNING *
        `;
      } else {
        // Múltiples campos - usar una consulta más compleja
        const camposActualizar = [];
        const valores = [];
        
        if (estado !== undefined) {
          camposActualizar.push('estado = $' + (valores.length + 1));
          valores.push(estado);
        }
        if (descripcion !== undefined) {
          camposActualizar.push('descripcion = $' + (valores.length + 1));
          valores.push(descripcion);
        }
        if (monto !== undefined) {
          camposActualizar.push('monto = $' + (valores.length + 1));
          valores.push(parseFloat(monto));
        }
        if (fecha !== undefined) {
          camposActualizar.push('fecha = $' + (valores.length + 1));
          valores.push(new Date(fecha));
        }
        if (categoriaId !== undefined) {
          camposActualizar.push('categoria_id = $' + (valores.length + 1));
          valores.push(parseInt(categoriaId));
        }
        if (notas !== undefined) {
          camposActualizar.push('notas = $' + (valores.length + 1));
          valores.push(notas);
        }
        
        if (camposActualizar.length === 0) {
          return res.status(400).json({ 
            success: false,
            error: 'No se proporcionaron campos para actualizar' 
          });
        }
        
        // Para múltiples campos, usar una consulta SQL directa
        const query = `
          UPDATE egresos 
          SET ${camposActualizar.join(', ')}
          WHERE id = $${valores.length + 1}
          RETURNING *
        `;
        
        console.log('📝 Query de actualización múltiple:', query);
        console.log('📝 Valores:', [...valores, parseInt(id)]);
        
        // Usar sql.unsafe para consultas complejas (si está disponible) o fallback
        try {
          resultado = await sql.unsafe(query, [...valores, parseInt(id)]);
        } catch (error) {
          console.error('Error con sql.unsafe, usando consulta simple:', error);
          // Fallback: actualizar solo el primer campo
          if (estado !== undefined) {
            resultado = await sql`
              UPDATE egresos 
              SET estado = ${estado}
              WHERE id = ${parseInt(id)}
              RETURNING *
            `;
          } else if (descripcion !== undefined) {
            resultado = await sql`
              UPDATE egresos 
              SET descripcion = ${descripcion}
              WHERE id = ${parseInt(id)}
              RETURNING *
            `;
          } else {
            throw new Error('No se pudo actualizar el egreso');
          }
        }
      }
      
      console.log('📝 Resultado de la actualización:', resultado);
      
      if (resultado.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'No se pudo actualizar el egreso' 
        });
      }
      
      const egresoActualizado = resultado[0];
      
      console.log(`✅ Egreso ${id} actualizado exitosamente`);
      
      res.json({
        success: true,
        message: 'Egreso actualizado exitosamente',
        data: egresoActualizado
      });
      
    } catch (error) {
      console.error('Error al actualizar egreso:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  });

  // Endpoint para obtener presupuesto mensual
  router.get('/presupuesto/mensual', async (req, res) => {
    try {
      const { usuarioId, mes, año } = req.query;
      
      if (!usuarioId || !mes || !año) {
        return res.status(400).json({
          success: false,
          error: 'Faltan parámetros requeridos: usuarioId, mes, año'
        });
      }

      console.log(`📊 Obteniendo presupuesto mensual para usuario: ${usuarioId}, mes: ${mes}, año: ${año}`);

      // Calcular fechas del mes
      const fechaInicio = new Date(parseInt(año), parseInt(mes) - 1, 1);
      const fechaFin = new Date(parseInt(año), parseInt(mes), 0);
      
      console.log(`📅 Rango de fechas: ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`);

      // Obtener total de egresos del mes
      const egresosMes = await sql`
        SELECT COALESCE(SUM(monto), 0) as total_gastado
        FROM egresos 
        WHERE usuario_id = ${parseInt(usuarioId)}
          AND fecha >= ${fechaInicio}
          AND fecha <= ${fechaFin}
      `;

      const totalGastado = egresosMes[0]?.total_gastado || 0;

      // Por ahora, retornamos un presupuesto fijo (puedes implementar lógica más compleja)
      const presupuestoMensual = {
        presupuesto_asignado: 5000000, // $5,000,000 - puedes hacer esto configurable
        total_gastado: totalGastado,
        saldo_disponible: 5000000 - totalGastado,
        porcentaje_usado: totalGastado > 0 ? (totalGastado / 5000000) * 100 : 0,
        mes: parseInt(mes),
        año: parseInt(año)
      };

      console.log('✅ Presupuesto mensual calculado:', presupuestoMensual);

      res.json({
        success: true,
        data: presupuestoMensual
      });

    } catch (error) {
      console.error('❌ Error al obtener presupuesto mensual:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  });

  // Ruta para obtener reporte anual
  router.get('/reporte-anual', async (req, res) => {
    try {
      const { usuarioId, año } = req.query;
      
      if (!usuarioId || !año) {
        return res.status(400).json({
          success: false,
          error: 'Faltan parámetros requeridos: usuarioId, año'
        });
      }

      console.log(`📊 Obteniendo reporte anual para usuario: ${usuarioId}, año: ${año}`);

      // Calcular fechas del año
      const fechaInicio = new Date(parseInt(año), 0, 1);
      const fechaFin = new Date(parseInt(año), 11, 31);
      
      console.log(`📅 Rango de fechas: ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`);

      // Obtener egresos del año con información de categorías y tipos
      const egresos = await sql`
        SELECT 
          e.*, 
          c.nombre as categoria_nombre,
          t.nombre as tipo_egreso_nombre
        FROM egresos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        LEFT JOIN tipo_egreso t ON c.tipo_egreso_id = t.id
        WHERE e.usuario_id = ${parseInt(usuarioId)}
          AND e.fecha >= ${fechaInicio}
          AND e.fecha <= ${fechaFin}
          AND e.estado != 'parcializado'
        ORDER BY e.fecha DESC
      `;

      console.log(`📊 Encontrados ${egresos.length} egresos del año ${año}`);

      res.json(egresos);
    } catch (error) {
      console.error('❌ Error al obtener reporte anual:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });

  // DELETE /api/egresos/:id - Eliminar un egreso
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log('🗑️ Eliminando egreso con ID:', id);
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID del egreso es requerido'
        });
      }

      // Verificar que el egreso existe
      const egresoExistente = await sql`
        SELECT id, descripcion, monto, usuario_id 
        FROM egresos 
        WHERE id = ${parseInt(id)}
      `;

      if (egresoExistente.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Egreso no encontrado'
        });
      }

      const egreso = egresoExistente[0];
      console.log('📋 Egreso encontrado:', {
        id: egreso.id,
        descripcion: egreso.descripcion,
        monto: egreso.monto,
        usuario_id: egreso.usuario_id
      });

      // Eliminar el egreso
      const resultado = await sql`
        DELETE FROM egresos 
        WHERE id = ${parseInt(id)}
      `;

      console.log('✅ Egreso eliminado exitosamente:', {
        id: id,
        descripcion: egreso.descripcion,
        monto: egreso.monto
      });

      res.json({
        success: true,
        message: 'Egreso eliminado exitosamente',
        data: {
          id: parseInt(id),
          descripcion: egreso.descripcion,
          monto: egreso.monto
        }
      });

    } catch (error) {
      console.error('❌ Error al eliminar egreso:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  });
  
  
    return router;
  };
  