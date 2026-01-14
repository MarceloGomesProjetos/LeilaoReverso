// backend/config/database.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'LeilaoReverso',
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

module.exports = { pool, query, testConnection };
