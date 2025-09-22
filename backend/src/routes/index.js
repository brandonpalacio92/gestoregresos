module.exports = (sql) => {
  const express = require('express');
  const router = express.Router();

  // Importar rutas específicas y pasar sql
  const authRoutes = require('./auth')(sql);
  const egresosRoutes = require('./egresos')(sql);

  // Ruta de prueba para la API
  router.get('/', (req, res) => {
    res.json({
      message: 'API de GestorEgresos',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
        auth: '/api/auth',
        egresos: '/api/egresos'
      }
    });
  });

  // Configurar rutas específicas
  router.use('/auth', authRoutes);
  router.use('/egresos', egresosRoutes);

  return router;
};
