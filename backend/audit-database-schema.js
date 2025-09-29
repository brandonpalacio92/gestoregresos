const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Configuración de producción
const productionConfig = require('./production-config');

class DatabaseAuditor {
  constructor() {
    this.developmentSql = null;
    this.productionSql = null;
    this.differences = [];
  }

  async connectToDatabases() {
    try {
      console.log('🔍 Conectando a base de datos de DESARROLLO...');
      this.developmentSql = neon(process.env.DATABASE_URL);
      await this.developmentSql`SELECT 1`;
      console.log('✅ Conectado a DESARROLLO');

      console.log('🔍 Conectando a base de datos de PRODUCCIÓN...');
      this.productionSql = neon(productionConfig.DATABASE_URL);
      await this.productionSql`SELECT 1`;
      console.log('✅ Conectado a PRODUCCIÓN');

    } catch (error) {
      console.error('❌ Error conectando a las bases de datos:', error.message);
      throw error;
    }
  }

  async getTableStructure(sql, tableName) {
    try {
      // Obtener información de columnas
      const columns = await sql`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      // Obtener información de claves primarias
      const primaryKeys = await sql`
        SELECT column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = ${tableName} 
          AND tc.constraint_type = 'PRIMARY KEY'
      `;

      // Obtener información de claves foráneas
      const foreignKeys = await sql`
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = ${tableName} 
          AND tc.constraint_type = 'FOREIGN KEY'
      `;

      return {
        columns: columns,
        primaryKeys: primaryKeys.map(pk => pk.column_name),
        foreignKeys: foreignKeys
      };
    } catch (error) {
      console.error(`❌ Error obteniendo estructura de tabla ${tableName}:`, error.message);
      return null;
    }
  }

  async getTableList(sql) {
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      return tables.map(t => t.table_name);
    } catch (error) {
      console.error('❌ Error obteniendo lista de tablas:', error.message);
      return [];
    }
  }

  async auditAllTables() {
    console.log('\n🔍 INICIANDO AUDITORÍA COMPLETA...\n');

    // Obtener lista de tablas en desarrollo
    const devTables = await this.getTableList(this.developmentSql);
    console.log('📋 Tablas en DESARROLLO:', devTables);

    // Obtener lista de tablas en producción
    const prodTables = await this.getTableList(this.productionSql);
    console.log('📋 Tablas en PRODUCCIÓN:', prodTables);

    // Comparar listas de tablas
    const allTables = [...new Set([...devTables, ...prodTables])];
    console.log('\n📊 TABLAS A AUDITAR:', allTables);

    const auditResults = {};

    for (const tableName of allTables) {
      console.log(`\n🔍 Auditando tabla: ${tableName}`);
      
      const devStructure = await this.getTableStructure(this.developmentSql, tableName);
      const prodStructure = await this.getTableStructure(this.productionSql, tableName);

      auditResults[tableName] = {
        development: devStructure,
        production: prodStructure,
        differences: this.compareTableStructures(tableName, devStructure, prodStructure)
      };

      if (auditResults[tableName].differences.length > 0) {
        console.log(`⚠️  DIFERENCIAS ENCONTRADAS en ${tableName}:`);
        auditResults[tableName].differences.forEach(diff => {
          console.log(`   - ${diff}`);
        });
      } else {
        console.log(`✅ ${tableName}: Sin diferencias`);
      }
    }

    return auditResults;
  }

  compareTableStructures(tableName, devStructure, prodStructure) {
    const differences = [];

    // Verificar si la tabla existe en ambos ambientes
    if (!devStructure && prodStructure) {
      differences.push(`Tabla ${tableName} existe solo en PRODUCCIÓN`);
      return differences;
    }
    if (devStructure && !prodStructure) {
      differences.push(`Tabla ${tableName} existe solo en DESARROLLO`);
      return differences;
    }
    if (!devStructure && !prodStructure) {
      differences.push(`Tabla ${tableName} no existe en ningún ambiente`);
      return differences;
    }

    // Comparar columnas
    const devColumns = devStructure.columns.map(c => c.column_name);
    const prodColumns = prodStructure.columns.map(c => c.column_name);

    // Columnas que están en desarrollo pero no en producción
    const missingInProd = devColumns.filter(col => !prodColumns.includes(col));
    missingInProd.forEach(col => {
      differences.push(`Columna '${col}' existe en DESARROLLO pero no en PRODUCCIÓN`);
    });

    // Columnas que están en producción pero no en desarrollo
    const missingInDev = prodColumns.filter(col => !devColumns.includes(col));
    missingInDev.forEach(col => {
      differences.push(`Columna '${col}' existe en PRODUCCIÓN pero no en DESARROLLO`);
    });

    // Comparar tipos de datos de columnas comunes
    const commonColumns = devColumns.filter(col => prodColumns.includes(col));
    for (const colName of commonColumns) {
      const devCol = devStructure.columns.find(c => c.column_name === colName);
      const prodCol = prodStructure.columns.find(c => c.column_name === colName);

      if (devCol.data_type !== prodCol.data_type) {
        differences.push(`Columna '${colName}': tipo de dato diferente (DEV: ${devCol.data_type}, PROD: ${prodCol.data_type})`);
      }

      if (devCol.is_nullable !== prodCol.is_nullable) {
        differences.push(`Columna '${colName}': nullable diferente (DEV: ${devCol.is_nullable}, PROD: ${prodCol.is_nullable})`);
      }
    }

    // Comparar claves primarias
    const devPK = devStructure.primaryKeys.sort();
    const prodPK = prodStructure.primaryKeys.sort();
    if (JSON.stringify(devPK) !== JSON.stringify(prodPK)) {
      differences.push(`Claves primarias diferentes (DEV: [${devPK.join(', ')}], PROD: [${prodPK.join(', ')}])`);
    }

    return differences;
  }

  generateReport(auditResults) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE DE AUDITORÍA DE BASE DE DATOS');
    console.log('='.repeat(80));

    const tablesWithDifferences = Object.keys(auditResults).filter(
      table => auditResults[table].differences.length > 0
    );

    if (tablesWithDifferences.length === 0) {
      console.log('\n✅ ¡EXCELENTE! No se encontraron diferencias entre los esquemas.');
      console.log('   Las bases de datos de desarrollo y producción están sincronizadas.');
    } else {
      console.log(`\n⚠️  Se encontraron diferencias en ${tablesWithDifferences.length} tabla(s):`);
      
      tablesWithDifferences.forEach(tableName => {
        console.log(`\n📋 TABLA: ${tableName}`);
        console.log('-'.repeat(50));
        auditResults[tableName].differences.forEach(diff => {
          console.log(`   ❌ ${diff}`);
        });
      });

      console.log('\n🔧 RECOMENDACIONES:');
      console.log('   1. Crear script de migración para sincronizar las diferencias');
      console.log('   2. Ejecutar migración en el ambiente que esté desactualizado');
      console.log('   3. Verificar que ambas bases de datos queden idénticas');
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Función principal
async function main() {
  const auditor = new DatabaseAuditor();
  
  try {
    await auditor.connectToDatabases();
    const auditResults = await auditor.auditAllTables();
    auditor.generateReport(auditResults);
    
    // Guardar resultados en archivo
    const fs = require('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      auditResults: auditResults
    };
    
    fs.writeFileSync('database-audit-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Reporte guardado en: database-audit-report.json');
    
  } catch (error) {
    console.error('❌ Error durante la auditoría:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = DatabaseAuditor;
