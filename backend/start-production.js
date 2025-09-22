const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './production.env' });

const { connectDB } = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const egresosRoutes = require('./src/routes/egresos');
const indexRoutes = require('./src/routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['capacitor://localhost', 'http://localhost'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/egresos', egresosRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
});

// Inicializar servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor de producción...');
    console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
    console.log(`🔗 Puerto: ${PORT}`);
    
    // Conectar a la base de datos
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor de producción ejecutándose en puerto ${PORT}`);
      console.log(`🌐 Accesible en: http://0.0.0.0:${PORT}`);
      console.log(`📱 Para la app móvil, usa: http://tu-ip-local:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor de producción:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
