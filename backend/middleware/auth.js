// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona os dados do usuário em req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Busca o token no header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'É necessário estar autenticado para acessar este recurso'
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({
        error: 'Formato de token inválido',
        message: 'Formato esperado: Bearer {token}'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        error: 'Token mal formatado',
        message: 'O token deve começar com "Bearer"'
      });
    }

    // Verifica e decodifica o token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expirado',
            message: 'Faça login novamente'
          });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Token inválido',
            message: 'O token fornecido é inválido'
          });
        }

        return res.status(401).json({
          error: 'Erro na autenticação',
          message: err.message
        });
      }

      // Adiciona os dados do usuário decodificados ao request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        user_type: decoded.user_type
      };

      // Continua para a próxima função
      next();
    });

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno na autenticação',
      message: error.message
    });
  }
};

/**
 * Middleware para verificar se o usuário é um comprador
 */
const isBuyer = (req, res, next) => {
  if (req.user.user_type !== 'buyer') {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Esta ação é permitida apenas para compradores'
    });
  }
  next();
};

/**
 * Middleware para verificar se o usuário é um fornecedor
 */
const isSupplier = (req, res, next) => {
  if (req.user.user_type !== 'supplier') {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Esta ação é permitida apenas para fornecedores'
    });
  }
  next();
};

/**
 * Middleware opcional de autenticação
 * Adiciona req.user se o token existir, mas não bloqueia se não existir
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return next();
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          user_type: decoded.user_type
        };
      }
      next();
    });

  } catch (error) {
    next();
  }
};

module.exports = authMiddleware;
module.exports.isBuyer = isBuyer;
module.exports.isSupplier = isSupplier;
module.exports.optionalAuth = optionalAuth;