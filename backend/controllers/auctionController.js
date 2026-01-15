const { query } = require('../config/database');
const aiService = require('../services/aiService');

// Criar um novo leilão
exports.createAuction = async (req, res) => {
  const { title, description, category, initial_price, end_date } = req.body;
  const buyer_id = req.user.id;

  try {
    const result = await query(
      `INSERT INTO auctions 
       (buyer_id, title, description, category, initial_price, 
        current_price, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $5, NOW(), $6, 'active')
       RETURNING *`,
      [buyer_id, title, description, category, initial_price, end_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar leilão:', error);
    res.status(500).json({ error: error.message });
  }
};

// Listar leilões ativos
exports.getActiveAuctions = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, u.company_name as buyer_company,
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
       FROM auctions a
       JOIN users u ON a.buyer_id = u.id
       WHERE a.status = 'active' AND a.end_date > NOW()
       ORDER BY a.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar leilões:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obter detalhes de um leilão
exports.getAuctionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM auctions WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Leilão não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBidSuggestion = async (req, res) => {
  const { id } = req.params; // ID do leilão    
  try {
    const suggestion = await aiService.generateStrategicBid(id);

    if (suggestion === null) {
      return res.status(404).json({ error: 'Leilão não encontrado ou sem dados suficientes para sugestão' });
    }

    res.json({
      auction_id: id, 
      suggestion_amount: suggestion,
      message: 'Sugestão de lance gerada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar sugestão de lance:', error);
    res.status(500).json({ error: error.message });
  }
};