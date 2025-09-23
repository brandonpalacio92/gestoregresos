// 📦 Importación de dependencias
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Configuración de producción
const productionConfig = require('./production-config');

// Debug: Mostrar variables de entorno
console.log('🔍 NODE_ENV detectado:', process.env.NODE_ENV);
console.log('🔍 DATABASE_URL actual:', process.env.DATABASE_URL ? 'Definida' : 'No definida');

// Configurar variables de entorno según el modo
if (process.env.NODE_ENV === 'production') {
  // Modo producción - usar configuración de producción
  process.env.DATABASE_URL = productionConfig.DATABASE_URL;
  process.env.JWT_SECRET = productionConfig.JWT_SECRET;
  process.env.CORS_ORIGIN = productionConfig.CORS_ORIGIN;
  console.log('🚀 Modo PRODUCCIÓN activado');
  console.log('🗄️ Base de datos:', productionConfig.DATABASE_URL.substring(0, 50) + '...');
} else {
  // Modo desarrollo - cargar desde .env
  require('dotenv').config();
  console.log('🛠️ Modo DESARROLLO activado');
  console.log('🗄️ Base de datos:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'No definida');
}

// 🚀 Inicialización de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Middlewares globales
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8100',
    'http://localhost:8101',
    'http://localhost:4200',
    'http://192.168.1.7:8101',
    'http://192.168.1.7:8100',
    'http://192.168.1.7:4200',
    productionConfig.CORS_ORIGIN
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔍 Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'API de GestorEgresos funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL (Neon.tech Serverless)'
  });
});

// 🏁 Función para iniciar el servidor
const startServer = async () => {
  try {
    const db = require('./src/config/database');
    await db.connectDB(); // ✅ Primero conectamos

    const sql = db.sql; // ✅ Ahora sí podemos acceder a sql

    // Ruta de salud
    app.get('/health', async (req, res) => {
      try {
        const result = await sql`SELECT version()`;
        res.json({
          status: 'OK',
          database: 'Connected',
          version: result[0].version,
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(503).json({
          status: 'ERROR',
          database: 'Disconnected',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Rutas y middleware
    const authMiddleware = require('./src/middleware/auth')(sql);
    const apiRoutes = require('./src/routes')(sql);
    app.use('/api', apiRoutes);

    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
      });
    });

    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
      });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8101'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🌐 API URL (Red Local): http://192.168.1.7:${PORT}`);
      console.log(`🗄️ Base de datos: PostgreSQL (Neon.tech Serverless)`);
      console.log(`📡 API Endpoints: http://192.168.1.7:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
