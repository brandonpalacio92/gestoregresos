const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkCategoriasStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla categorias...\n');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Obtener información de las columnas
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'categorias'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Columnas de la tabla categorias:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar si existe tipo_id
    const hasTipoId = columns.some(col => col.column_name === 'tipo_id');
    console.log(`\n🔍 ¿Existe columna tipo_id? ${hasTipoId ? '✅ SÍ' : '❌ NO'}`);
    
    // Verificar si existe tipo_egreso_id
    const hasTipoEgresoId = columns.some(col => col.column_name === 'tipo_egreso_id');
    console.log(`🔍 ¿Existe columna tipo_egreso_id? ${hasTipoEgresoId ? '✅ SÍ' : '❌ NO'}`);
    
    if (!hasTipoId && !hasTipoEgresoId) {
      console.log('\n❌ PROBLEMA: No existe ni tipo_id ni tipo_egreso_id en la tabla categorias');
      console.log('   Esto causará errores en las consultas que usan c.tipo_id');
    } else if (hasTipoId && !hasTipoEgresoId) {
      console.log('\n⚠️  ADVERTENCIA: Existe tipo_id pero no tipo_egreso_id');
      console.log('   El código usa c.tipo_id, que debería funcionar');
    } else if (!hasTipoId && hasTipoEgresoId) {
      console.log('\n⚠️  ADVERTENCIA: Existe tipo_egreso_id pero no tipo_id');
      console.log('   El código usa c.tipo_id, pero la columna se llama tipo_egreso_id');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCategoriasStructure();
