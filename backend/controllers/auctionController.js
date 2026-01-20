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

// Atualizar um leilão
exports.updateAuction = async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  const buyer_id = req.user.id;

  try {
    const result = await query(
      `UPDATE auctions 
       SET title = $1, description = $2, category = $3
       WHERE id = $4 AND buyer_id = $5
       RETURNING *`,
      [title, description, category, id, buyer_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leilão não encontrado ou você não tem permissão para editá-lo' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar leilão:', error);
    res.status(500).json({ error: error.message });
  }
};

// Deletar um leilão
exports.deleteAuction = async (req, res) => {
  const { id } = req.params;
  const buyer_id = req.user.id;

  try {
    const result = await query(
      'DELETE FROM auctions WHERE id = $1 AND buyer_id = $2 RETURNING *',
      [id, buyer_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leilão não encontrado ou você não tem permissão para deletá-lo' });
    }
    
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar leilão:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fechar um leilão
exports.closeAuction = async (req, res) => {
  const { id } = req.params;
  const buyer_id = req.user.id;

  try {
    const result = await query(
      `UPDATE auctions 
       SET status = 'closed'
       WHERE id = $1 AND buyer_id = $2
       RETURNING *`,
      [id, buyer_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leilão não encontrado ou você não tem permissão para fechá-lo' });
    }
    
    // Aqui, futuramente, poderia ser adicionada a lógica para determinar o vencedor
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao fechar leilão:', error);
    res.status(500).json({ error: error.message });
  }
};

// Gerar relatório de IA para um leilão
exports.getAuctionReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await aiService.generateAuctionReport(id);
    if (!report) {
      return res.status(404).json({ error: 'Relatório não pôde ser gerado ou leilão não encontrado.' });
    }
    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório de IA:', error);
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