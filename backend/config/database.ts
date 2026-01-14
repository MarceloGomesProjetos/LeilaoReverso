import { Pool, PoolClient } from 'pg'; // Substitui require
import dotenv from 'dotenv';

dotenv.config();

// Exporta como constante para ser importada pelo AuthController
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432, // TS exige que a porta seja número
  database: process.env.DB_NAME || 'LeilaoReverso',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Tipagem do parâmetro params como any[] para aceitar os dados do usuário
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.error('Erro na query:', error.message);
    throw error;
  }
};

// Exporta as outras funções seguindo o mesmo padrão...