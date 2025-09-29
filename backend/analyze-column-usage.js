const fs = require('fs');
const path = require('path');

class ColumnUsageAnalyzer {
  constructor() {
    this.usage = {
      categorias: {},
      egresos: {},
      usuarios: {},
      tipo_egreso: {},
      presupuestos: {},
      presupuesto_mensual: {}
    };
  }

  analyzeCodebase() {
    console.log('🔍 Analizando uso de columnas en el código...\n');

    // Analizar archivos del backend
    this.analyzeDirectory('./src', 'backend');
    
    // Analizar archivos del frontend
    this.analyzeDirectory('../src', 'frontend');

    return this.usage;
  }

  analyzeDirectory(dirPath, context) {
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          this.analyzeDirectory(fullPath, context);
        } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
          this.analyzeFile(fullPath, context);
        }
      }
    } catch (error) {
      console.log(`⚠️  No se pudo analizar directorio ${dirPath}: ${error.message}`);
    }
  }

  analyzeFile(filePath, context) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Buscar referencias a columnas en consultas SQL
      const sqlPatterns = [
        /SELECT\s+([^FROM]+)\s+FROM\s+(\w+)/gi,
        /INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)/gi,
        /UPDATE\s+(\w+)\s+SET\s+([^WHERE]+)/gi
      ];

      sqlPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const tableName = match[1] || match[2];
          const columns = match[1] || match[2];
          
          if (this.usage[tableName]) {
            this.extractColumns(columns, tableName, filePath, context);
          }
        }
      });

      // Buscar referencias directas a columnas
      const columnPatterns = [
        /\.(\w+)\s*[=:]/g,
        /['"`](\w+)['"`]\s*:/g,
        /(\w+):\s*[^,}]/g
      ];

      columnPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const columnName = match[1];
          this.checkColumnUsage(columnName, filePath, context);
        }
      });

    } catch (error) {
      console.log(`⚠️  Error analizando archivo ${filePath}: ${error.message}`);
    }
  }

  extractColumns(columnsString, tableName, filePath, context) {
    if (!columnsString) return;

    // Limpiar y dividir columnas
    const columns = columnsString
      .split(',')
      .map(col => col.trim())
      .filter(col => col && col !== '*')
      .map(col => col.replace(/\s+as\s+\w+/i, '').trim());

    columns.forEach(column => {
      if (this.usage[tableName]) {
        this.usage[tableName][column] = {
          used: true,
          files: [...(this.usage[tableName][column]?.files || []), `${context}:${filePath}`],
          contexts: [...(this.usage[tableName][column]?.contexts || []), context]
        };
      }
    });
  }

  checkColumnUsage(columnName, filePath, context) {
    // Verificar si la columna pertenece a alguna tabla conocida
    Object.keys(this.usage).forEach(tableName => {
      if (this.usage[tableName][columnName]) {
        this.usage[tableName][columnName].used = true;
        this.usage[tableName][columnName].files = [
          ...(this.usage[tableName][columnName].files || []), 
          `${context}:${filePath}`
        ];
        this.usage[tableName][columnName].contexts = [
          ...(this.usage[tableName][columnName].contexts || []), 
          context
        ];
      }
    });
  }

  generateRecommendations() {
    console.log('\n📊 ANÁLISIS DE USO DE COLUMNAS\n');
    console.log('='.repeat(80));

    const recommendations = {};

    Object.keys(this.usage).forEach(tableName => {
      const tableUsage = this.usage[tableName];
      const usedColumns = Object.keys(tableUsage).filter(col => tableUsage[col].used);
      const unusedColumns = Object.keys(tableUsage).filter(col => !tableUsage[col].used);

      recommendations[tableName] = {
        used: usedColumns,
        unused: unusedColumns,
        total: Object.keys(tableUsage).length
      };

      console.log(`\n📋 TABLA: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(50));
      
      if (usedColumns.length > 0) {
        console.log(`✅ Columnas UTILIZADAS (${usedColumns.length}):`);
        usedColumns.forEach(col => {
          const usage = tableUsage[col];
          console.log(`   - ${col} (usado en ${usage.files.length} archivo(s))`);
        });
      }

      if (unusedColumns.length > 0) {
        console.log(`❌ Columnas NO UTILIZADAS (${unusedColumns.length}):`);
        unusedColumns.forEach(col => {
          console.log(`   - ${col}`);
        });
      }

      if (Object.keys(tableUsage).length === 0) {
        console.log('   ⚠️  No se encontraron referencias a esta tabla en el código');
      }
    });

    return recommendations;
  }

  generateSchemaRecommendations() {
    console.log('\n🎯 RECOMENDACIONES DE ESQUEMA HÍBRIDO\n');
    console.log('='.repeat(80));

    const schemaRecommendations = {
      categorias: {
        keep: ['id', 'nombre', 'tipo_egreso_id'],
        add: ['color', 'icono', 'created_at', 'updated_at'],
        remove: ['orden']
      },
      egresos: {
        keep: ['id', 'descripcion', 'monto', 'fecha', 'categoria_id', 'usuario_id', 'estado', 'notas'],
        add: ['created_at', 'updated_at'],
        remove: ['fecha_registro', 'tipo_id', 'fecha_inicio']
      },
      usuarios: {
        keep: ['id', 'email', 'password', 'nombre', 'apellido', 'telefono', 'fecha_nacimiento', 'is_active'],
        add: ['created_at', 'updated_at'],
        remove: ['fecha_registro']
      },
      tipo_egreso: {
        keep: ['id', 'nombre'],
        add: ['descripcion', 'created_at', 'updated_at'],
        remove: []
      },
      presupuestos: {
        keep: ['id', 'usuario_id'],
        add: ['categoria', 'monto_limite', 'monto_gastado', 'created_at', 'updated_at'],
        remove: ['monto_total']
      },
      presupuesto_mensual: {
        keep: ['id', 'usuario_id', 'mes', 'año', 'presupuesto_asignado'],
        add: ['created_at', 'updated_at'],
        remove: []
      }
    };

    Object.keys(schemaRecommendations).forEach(tableName => {
      const rec = schemaRecommendations[tableName];
      console.log(`\n📋 ${tableName.toUpperCase()}:`);
      console.log(`   ✅ Mantener: ${rec.keep.join(', ')}`);
      console.log(`   ➕ Agregar: ${rec.add.join(', ')}`);
      console.log(`   ➖ Eliminar: ${rec.remove.join(', ')}`);
    });

    return schemaRecommendations;
  }
}

// Función principal
async function main() {
  const analyzer = new ColumnUsageAnalyzer();
  
  try {
    const usage = analyzer.analyzeCodebase();
    const recommendations = analyzer.generateRecommendations();
    const schemaRecs = analyzer.generateSchemaRecommendations();
    
    // Guardar análisis en archivo
    const analysisData = {
      timestamp: new Date().toISOString(),
      usage: usage,
      recommendations: recommendations,
      schemaRecommendations: schemaRecs
    };
    
    fs.writeFileSync('column-usage-analysis.json', JSON.stringify(analysisData, null, 2));
    console.log('\n💾 Análisis guardado en: column-usage-analysis.json');
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = ColumnUsageAnalyzer;
