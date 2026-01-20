// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');
const { sendResetPasswordEmail } = require('../services/emailService');

// Função para gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      user_type: user.user_type
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Registro de novo usuário
exports.register = async (req, res) => {
  const { name, email, password, user_type, phone, company_name } = req.body;

  try {
    // Validações básicas
    if (!name || !email || !password || !user_type) {
      return res.status(400).json({
        error: 'Campos obrigatórios: name, email, password, user_type'
      });
    }

    // Valida tipo de usuário
    if (!['buyer', 'supplier'].includes(user_type)) {
      return res.status(400).json({
        error: 'user_type deve ser "buyer" ou "supplier"'
      });
    }

    // Valida formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Valida senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verifica se o email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insere o novo usuário
    const result = await query(
      `INSERT INTO users 
       (name, email, password_hash, user_type, phone, company_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, user_type, phone, company_name, created_at`,
      [name, email.toLowerCase(), passwordHash, user_type, phone, company_name]
    );

    const newUser = result.rows[0];

    // Gera token JWT
    const token = generateToken(newUser);

    // Retorna dados do usuário sem a senha
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        user_type: newUser.user_type,
        phone: newUser.phone,
        company_name: newUser.company_name,
        created_at: newUser.created_at
      },
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro ao registrar usuário',
      details: error.message
    });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Busca o usuário pelo email
    const result = await query(
      `SELECT id, name, email, password_hash, user_type, phone, company_name, created_at
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    const user = result.rows[0];

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Gera token JWT
    const token = generateToken(user);

    // Retorna dados do usuário sem a senha
    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        phone: user.phone,
        company_name: user.company_name,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      details: error.message
    });
  }
};

// Obter perfil do usuário autenticado
exports.getProfile = async (req, res) => {
  try {
    // req.user já vem do middleware de autenticação
    const userId = req.user.id;

    const result = await query(
      `SELECT id, name, email, user_type, phone, company_name, created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro ao buscar perfil',
      details: error.message
    });
  }
};

// Atualizar perfil do usuário
exports.updateProfile = async (req, res) => {
  const { name, phone, company_name } = req.body;
  const userId = req.user.id;

  try {
    // Campos que podem ser atualizados
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (phone) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (company_name) {
      updates.push(`company_name = $${paramCount}`);
      values.push(company_name);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar'
      });
    }

    // Adiciona o ID do usuário
    values.push(userId);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, name, email, user_type, phone, company_name, updated_at`,
      values
    );

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro ao atualizar perfil',
      details: error.message
    });
  }
};

// Alterar senha
exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  const userId = req.user.id;

  try {
    // Validações
    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter no mínimo 6 caracteres'
      });
    }

    // Busca senha atual do usuário
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    // Verifica senha atual
    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Atualiza a senha
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro ao alterar senha',
      details: error.message
    });
  }
};

// Validar token (útil para refresh)
exports.validateToken = async (req, res) => {
  try {
    // Se chegou aqui, o token já foi validado pelo middleware
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        user_type: req.user.user_type
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao validar token',
      details: error.message
    });
  }
};

// Solicitar recuperação de senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      // Para não revelar se um email está ou não cadastrado, enviamos uma resposta de sucesso genérica
      return res.json({ message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' });
    }

    // Gerar token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Definir data de expiração (1 hora)
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [tokenHash, expires, email.toLowerCase()]
    );

    // --- PARA DESENVOLVIMENTO ---
    // O envio de email foi desativado temporariamente para permitir o teste do fluxo de recuperação de senha
    // sem a necessidade de configurar um servidor de email. O token de reset será retornado na resposta.
    // Em produção, remova a linha com `token` e descomente a linha `await sendResetPasswordEmail(email, token);`
    
    // await sendResetPasswordEmail(email, token);

    res.json({ 
        message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado. (DEV ONLY: token abaixo)',
        token: token // Apenas para desenvolvimento
    });

  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
};

// Redefinir a senha
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Senha inválida ou menor que 6 caracteres.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const userResult = await query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [tokenHash]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const user = userResult.rows[0];

    // Hash da nova senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Atualiza a senha e limpa o token
    await query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() WHERE id = $2',
      [passwordHash, user.id]
    );

    res.json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
  }
};