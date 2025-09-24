// Configuración de producción
module.exports = {
  // Base de datos de producción (forzada)
  DATABASE_URL: 'postgresql://neondb_owner:npg_iqUIK2WoBeC3@ep-mute-mode-adye8fyz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  
  // Configuración del servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: 'production',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'tu-clave-secreta-super-segura-para-produccion',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://192.168.1.7:8101'
};
