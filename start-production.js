const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando aplicación en modo producción...');

// Configurar variables de entorno para producción
process.env.NODE_ENV = 'production';

// Cambiar al directorio backend
const backendPath = path.join(__dirname, 'backend');

// Ejecutar el servidor de producción
const serverProcess = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`📊 Servidor terminado con código: ${code}`);
  process.exit(code);
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  serverProcess.kill('SIGTERM');
});
