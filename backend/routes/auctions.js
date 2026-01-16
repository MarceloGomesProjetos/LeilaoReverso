const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const authMiddleware = require('../middleware/auth');

// Rotas Públicas
// Importante: /active deve vir antes de /:id para não ser interpretado como um ID
router.get('/active', auctionController.getActiveAuctions);

// Rota para buscar um leilão específico pelo ID
router.get('/:id', auctionController.getAuctionById);

// Rotas Protegidas (precisam de login)
router.post('/', authMiddleware, auctionController.createAuction);
router.put('/:id', authMiddleware, auctionController.updateAuction);
router.delete('/:id', authMiddleware, auctionController.deleteAuction);
router.post('/:id/close', authMiddleware, auctionController.closeAuction);
router.get('/:id/report', authMiddleware, auctionController.getAuctionReport);

// Rotas com parâmetros (deixar por último)
router.get('/:id/suggest', authMiddleware, auctionController.getBidSuggestion);

module.exports = router;
