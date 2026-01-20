// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário (comprador ou fornecedor)
 * @access  Public
 * @body    { name, email, password, user_type, phone?, company_name? }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário autenticado
 * @access  Private (requer autenticação)
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário autenticado
 * @access  Private (requer autenticação)
 * @body    { name?, phone?, company_name? }
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Alterar senha do usuário autenticado
 * @access  Private (requer autenticação)
 * @body    { current_password, new_password }
 */
router.put('/change-password', authMiddleware, authController.changePassword);


/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar redefinição de senha
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Redefinir a senha com um token válido
 * @access  Public
 * @body    { password }
 */
router.post('/reset-password/:token', authController.resetPassword);

/**
 * @route   GET /api/auth/validate
 * @desc    Validar token JWT
 * @access  Private (requer autenticação)
 */
router.get('/validate', authMiddleware, authController.validateToken);

module.exports = router;