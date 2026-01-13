const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const authMiddleware = require('../middleware/auth');

// Rotas Públicas
// Importante: /active deve vir antes de /:id para não ser interpretado como um ID
router.get('/active', auctionController.getActiveAuctions);

// Rotas Protegidas (precisam de login)
router.post('/', authMiddleware, auctionController.createAuction);

// Rotas com parâmetros (deixar por último)
router.get('/:id', auctionController.getAuctionById);

module.exports = router;