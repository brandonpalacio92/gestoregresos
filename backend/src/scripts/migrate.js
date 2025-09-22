const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('../config/database');

// Función para ejecutar migraciones
const runMigrations = async () => {
  try {
    console.log('🔄 Iniciando migraciones...');
    console.log('🔍 DATABASE_URL configurada:', process.env.DATABASE_URL ? 'Sí' : 'No');
    
    // Conectar a la base de datos
    await connectDB();
    
    // Importar sql después de conectar
    const { sql } = require('../config/database');
    
    // Obtener la lista de archivos de migración
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Encontradas ${migrationFiles.length} migraciones`);

    // Crear tabla de control de migraciones si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ejecutar cada migración
    for (const file of migrationFiles) {
      try {
        // Verificar si la migración ya fue ejecutada
        const result = await sql`
          SELECT id FROM migrations WHERE filename = ${file}
        `;

        if (result.length > 0) {
          console.log(`⏭️  Migración ${file} ya ejecutada, omitiendo...`);
          continue;
        }

        console.log(`🔄 Ejecutando migración: ${file}`);
        
        // Leer el archivo de migración
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Ejecutar la migración
        await sql`${migrationSQL}`;

        // Registrar la migración como ejecutada
        await sql`
          INSERT INTO migrations (filename) VALUES (${file})
        `;

        console.log(`✅ Migración ${file} ejecutada exitosamente`);
      } catch (error) {
        console.error(`❌ Error ejecutando migración ${file}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 Todas las migraciones ejecutadas exitosamente');
  } catch (error) {
    console.error('❌ Error en las migraciones:', error);
    process.exit(1);
  }
};

// Función para verificar el estado de las migraciones
const checkMigrations = async () => {
  try {
    await connectDB();
    
    // Importar sql después de conectar
    const { sql } = require('../config/database');
    
    const migrations = await sql`
      SELECT filename, executed_at 
      FROM migrations 
      ORDER BY executed_at
    `;

    console.log('📋 Estado de las migraciones:');
    if (migrations.length === 0) {
      console.log('   No hay migraciones ejecutadas');
    } else {
      migrations.forEach(migration => {
        console.log(`   ✅ ${migration.filename} - ${migration.executed_at}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verificando migraciones:', error);
  }
};

// Ejecutar según el comando
const command = process.argv[2];

switch (command) {
  case 'migrate':
    runMigrations();
    break;
  case 'status':
    checkMigrations();
    break;
  default:
    console.log('Uso: node migrate.js [migrate|status]');
    console.log('  migrate - Ejecutar migraciones pendientes');
    console.log('  status  - Verificar estado de migraciones');
    process.exit(1);
}

