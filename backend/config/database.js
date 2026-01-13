// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'LeilaoReverso',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo que um cliente pode ficar inativo
  connectionTimeoutMillis: 2000, // Tempo máximo para estabelecer conexão
});

// Evento de erro no pool
pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do pool', err);
  process.exit(-1);
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    // Testa uma query simples
    const result = await client.query('SELECT NOW()');
    console.log(`⏰ Horário do servidor: ${result.rows[0].now}`);
    
    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar no PostgreSQL:', err.message);
    console.error('Verifique suas credenciais no arquivo .env');
    process.exit(1);
  }
};

// Função helper para executar queries com tratamento de erro
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query:', error.message);
    throw error;
  }
};

// Função para transações
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Sobrescreve o release para evitar erros
  client.release = () => {
    client.release = release;
    return release();
  };
  
  return client;
};

// Função para executar transações
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Exporta o pool e funções helper
module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
};