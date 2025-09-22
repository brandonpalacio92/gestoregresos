const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../../production.env') });

const setupProductionDB = async () => {
  let sql;
  
  try {
    console.log('🔗 Conectando a la base de datos de producción...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL no está definida en production.env');
    }

    sql = neon(process.env.DATABASE_URL);
    
    // Probar conexión
    await sql`SELECT 1`;
    console.log('✅ Conectado a la base de datos de producción');

    console.log('📋 Creando tablas...');

    // 1. Tabla usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        fecha_nacimiento DATE,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'User',
        telefono VARCHAR(20),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla usuarios creada');

    // 2. Tabla categorias_egreso
    await sql`
      CREATE TABLE IF NOT EXISTS categorias_egreso (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        activa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla categorias_egreso creada');

    // 3. Tabla tipo_egreso
    await sql`
      CREATE TABLE IF NOT EXISTS tipo_egreso (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla tipo_egreso creada');

    // 4. Tabla egresos
    await sql`
      CREATE TABLE IF NOT EXISTS egresos (
        id SERIAL PRIMARY KEY,
        descripcion VARCHAR(255) NOT NULL,
        monto DECIMAL(15,2) NOT NULL,
        fecha DATE NOT NULL,
        categoria_id INTEGER REFERENCES categorias_egreso(id),
        tipo_id INTEGER REFERENCES tipo_egreso(id),
        usuario_id INTEGER REFERENCES usuarios(id),
        es_periodico BOOLEAN DEFAULT false,
        frecuencia VARCHAR(20),
        fecha_inicio DATE,
        fecha_fin DATE,
        estado VARCHAR(20) DEFAULT 'pendiente',
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla egresos creada');

    // 5. Tabla presupuesto_mensual
    await sql`
      CREATE TABLE IF NOT EXISTS presupuesto_mensual (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        mes INTEGER NOT NULL,
        año INTEGER NOT NULL,
        presupuesto_asignado DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, mes, año)
      )
    `;
    console.log('✅ Tabla presupuesto_mensual creada');

    console.log('🌱 Insertando datos iniciales...');

    // Insertar categorías por defecto
    const categorias = [
      { nombre: 'Alimentación', descripcion: 'Gastos en comida y bebida', color: '#EF4444' },
      { nombre: 'Transporte', descripcion: 'Gastos de movilidad', color: '#3B82F6' },
      { nombre: 'Vivienda', descripcion: 'Arriendo, servicios públicos', color: '#10B981' },
      { nombre: 'Salud', descripcion: 'Gastos médicos y farmacia', color: '#F59E0B' },
      { nombre: 'Educación', descripcion: 'Gastos educativos', color: '#8B5CF6' },
      { nombre: 'Entretenimiento', descripcion: 'Ocio y diversión', color: '#EC4899' },
      { nombre: 'Ropa', descripcion: 'Vestimenta y calzado', color: '#06B6D4' },
      { nombre: 'Otros', descripcion: 'Gastos varios', color: '#6B7280' }
    ];

    for (const categoria of categorias) {
      await sql`
        INSERT INTO categorias_egreso (nombre, descripcion, color)
        VALUES (${categoria.nombre}, ${categoria.descripcion}, ${categoria.color})
      `;
    }
    console.log('✅ Categorías insertadas');

    // Insertar tipos de egreso
    const tipos = [
      { nombre: 'Gasto Fijo', descripcion: 'Gastos que se repiten mensualmente' },
      { nombre: 'Gasto Variable', descripcion: 'Gastos que varían según el mes' },
      { nombre: 'Deuda', descripcion: 'Pagos de deudas y créditos' },
      { nombre: 'Emergencia', descripcion: 'Gastos imprevistos' }
    ];

    for (const tipo of tipos) {
      await sql`
        INSERT INTO tipo_egreso (nombre, descripcion)
        VALUES (${tipo.nombre}, ${tipo.descripcion})
      `;
    }
    console.log('✅ Tipos de egreso insertados');

    console.log('🎉 Base de datos de producción configurada exitosamente!');
    console.log('📊 Resumen de tablas creadas:');
    console.log('   - usuarios');
    console.log('   - categorias_egreso');
    console.log('   - tipo_egreso');
    console.log('   - egresos');
    console.log('   - presupuesto_mensual');

  } catch (error) {
    console.error('❌ Error configurando la base de datos de producción:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  setupProductionDB()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionDB };
