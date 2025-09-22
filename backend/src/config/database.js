const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

let sql = null;

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL no está definida en el entorno');
    }

    sql = neon(process.env.DATABASE_URL);

    await sql`SELECT 1`;
    console.log('✅ Conectado a PostgreSQL (Neon.tech)');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    throw error;
  }
};

const getSql = () => {
  if (!sql) {
    throw new Error('Base de datos no inicializada. Llama a connectDB() primero.');
  }
  return sql;
};

const testConnection = async () => {
  const result = await getSql()`SELECT version()`;
  return result[0];
};

module.exports = {
  connectDB,
  get sql() { return getSql(); },
  testConnection
};
