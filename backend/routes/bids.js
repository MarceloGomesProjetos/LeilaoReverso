// routes/bids.js
const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route   POST /api/bids
 * @desc    Criar novo lance (apenas fornecedores)
 * @access  Private (Supplier only)
 * @body    { auction_id, bid_amount, delivery_days?, comments? }
 */
router.post('/', bidController.createBid);

/**
 * @route   GET /api/bids/my-bids
 * @desc    Listar lances do fornecedor autenticado
 * @access  Private (Supplier only)
 * @query   status? (winning, losing)
 */
router.get('/my-bids', bidController.getMyBids);

/**
 * @route   GET /api/bids/auction/:auction_id
 * @desc    Listar todos os lances de um leilão
 * @access  Private
 */
router.get('/auction/:auction_id', bidController.getBidsByAuction);

/**
 * @route   GET /api/bids/auction/:auction_id/statistics
 * @desc    Obter estatísticas dos lances de um leilão
 * @access  Private
 */
router.get('/auction/:auction_id/statistics', bidController.getBidStatistics);

/**
 * @route   GET /api/bids/:id
 * @desc    Obter detalhes de um lance específico
 * @access  Private (Owner or Buyer)
 */
router.get('/:id', bidController.getBidById);

/**
 * @route   DELETE /api/bids/:id
 * @desc    Retirar lance (apenas dono do lance)
 * @access  Private (Supplier only - owner)
 */
router.delete('/:id', bidController.withdrawBid);

module.exports = router;