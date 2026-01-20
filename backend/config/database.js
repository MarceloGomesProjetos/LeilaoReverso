// backend/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'ShortWin',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Versão simplificada que você escolheu
const query = async (text, params) => {
  return pool.query(text, params);
};

// Adicionado para testar a conexão no server.js
const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Conexão com o banco de dados bem-sucedida.');
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
    }
};

// Função para executar transações
const transaction = async (callback) => {
    const client = await pool.connect();
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

module.exports = { pool, query, testConnection, transaction };
