// routes/notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route   GET /api/notifications
 * @desc    Listar todas as notificações do usuário autenticado
 * @access  Private
 * @query   is_read? (true, false), limit?, offset?
 */
router.get('/', notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obter contagem de notificações não lidas
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificação como lida
 * @access  Private
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Marcar todas as notificações como lidas
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Deletar uma notificação específica
 * @access  Private
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications
 * @desc    Deletar todas as notificações do usuário
 * @access  Private
 */
router.delete('/', notificationController.deleteAllNotifications);

module.exports = router;