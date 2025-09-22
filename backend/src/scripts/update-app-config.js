const fs = require('fs');
const path = require('path');

const updateAppConfig = () => {
  try {
    console.log('📱 Actualizando configuración de la aplicación móvil...');

    // Ruta al archivo de configuración de la app
    const configPath = path.join(__dirname, '../../../src/environments/environment.prod.ts');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(configPath)) {
      console.log('📝 Creando archivo de configuración de producción...');
      
      // Crear directorio si no existe
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Contenido del archivo de configuración
    const configContent = `export const environment = {
  production: true,
  apiUrl: 'https://tu-servidor-produccion.com/api', // Cambia por tu URL de producción
  // O si usas la misma máquina:
  // apiUrl: 'http://tu-ip-local:3000/api',
};
`;

    // Escribir el archivo
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Archivo environment.prod.ts actualizado');

    // También actualizar el archivo de desarrollo para referencia
    const devConfigPath = path.join(__dirname, '../../../src/environments/environment.ts');
    const devConfigContent = `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
`;

    if (!fs.existsSync(devConfigPath)) {
      fs.writeFileSync(devConfigPath, devConfigContent);
      console.log('✅ Archivo environment.ts creado');
    }

    console.log('📋 Instrucciones para completar la configuración:');
    console.log('1. Actualiza la URL en environment.prod.ts con tu servidor de producción');
    console.log('2. Reconstruye la aplicación: ionic build --prod');
    console.log('3. Sincroniza con Capacitor: npx cap sync');
    console.log('4. Regenera la APK en Android Studio');

  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  updateAppConfig();
}

module.exports = { updateAppConfig };
