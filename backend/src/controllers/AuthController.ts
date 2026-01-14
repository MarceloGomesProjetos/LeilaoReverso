import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// backend/controllers/authController.ts
import { pool } from '../config/database'; // O TS resolve a extensão automaticamente

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // 1. Busca o usuário pelo e-mail (Baseado no seu ScriptDB)
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        // 2. Verifica se a senha está correta (Compara com password_hash)
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Senha inválida' });
        }

        // 3. Gera o Token JWT incluindo o ID e o user_type (buyer/supplier)
        const token = jwt.sign(
            { id: user.id, user_type: user.user_type },
            process.env.JWT_SECRET || 'secret_fallback',
            { expiresIn: '1d' }
        );

        // 4. Retorna o token e os dados básicos para o Frontend
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                user_type: user.user_type
            }
        });

    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};