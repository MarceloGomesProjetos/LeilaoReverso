// controllers/bidController.js
const { query, transaction } = require('../config/database');
const { broadcast } = require('../utils/websocket');

// Criar um novo lance
exports.createBid = async (req, res) => {
  const { auction_id, bid_amount, delivery_days, comments } = req.body;
  const supplier_id = req.user.id;

  try {
    // Validações básicas
    if (!auction_id || !bid_amount) {
      return res.status(400).json({
        error: 'auction_id e bid_amount são obrigatórios'
      });
    }

    // Valida se o valor do lance é positivo
    if (bid_amount <= 0) {
      return res.status(400).json({
        error: 'Valor do lance deve ser maior que zero'
      });
    }

    // Verifica se o usuário é um fornecedor
    if (req.user.user_type !== 'supplier') {
      return res.status(403).json({
        error: 'Apenas fornecedores podem fazer lances'
      });
    }

    // Usa transação para garantir consistência
    const result = await transaction(async (client) => {
      // Busca informações do leilão
      const auctionResult = await client.query(
        `SELECT id, buyer_id, initial_price, current_price, end_date, status
         FROM auctions 
         WHERE id = $1`,
        [auction_id]
      );

      if (auctionResult.rows.length === 0) {
        throw new Error('Leilão não encontrado');
      }

      const auction = auctionResult.rows[0];

      // Verifica se o leilão está ativo
      if (auction.status !== 'active') {
        throw new Error('Leilão não está ativo');
      }

      // Verifica se o leilão ainda não encerrou
      if (new Date(auction.end_date) < new Date()) {
        throw new Error('Leilão já encerrado');
      }

      // Verifica se o fornecedor não é o dono do leilão
      if (auction.buyer_id === supplier_id) {
        throw new Error('Você não pode dar lance no seu próprio leilão');
      }

      // Verifica se o lance é menor que o preço atual ou inicial
      const currentPrice = auction.current_price || auction.initial_price;
      if (bid_amount >= currentPrice) {
        throw new Error(`Lance deve ser menor que ${currentPrice.toFixed(2)}`);
      }

      // Verifica se o fornecedor já tem um lance para este leilão
      const existingBidResult = await client.query(
        'SELECT id FROM bids WHERE auction_id = $1 AND supplier_id = $2',
        [auction_id, supplier_id]
      );

      let bidResult;

      if (existingBidResult.rows.length > 0) {
        // Atualiza o lance existente
        bidResult = await client.query(
          `UPDATE bids 
           SET bid_amount = $1, delivery_days = $2, comments = $3, created_at = CURRENT_TIMESTAMP
           WHERE auction_id = $4 AND supplier_id = $5
           RETURNING id, auction_id, supplier_id, bid_amount, delivery_days, comments, created_at`,
          [bid_amount, delivery_days, comments, auction_id, supplier_id]
        );
      } else {
        // Cria um novo lance
        bidResult = await client.query(
          `INSERT INTO bids (auction_id, supplier_id, bid_amount, delivery_days, comments)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, auction_id, supplier_id, bid_amount, delivery_days, comments, created_at`,
          [auction_id, supplier_id, bid_amount, delivery_days, comments]
        );
      }

      // Atualiza o preço atual do leilão
      await client.query(
        'UPDATE auctions SET current_price = $1 WHERE id = $2',
        [bid_amount, auction_id]
      );

      // Cria notificação para o comprador
      await client.query(
        `INSERT INTO notifications (user_id, auction_id, type, message)
         VALUES ($1, $2, 'new_bid', 'Novo lance recebido no seu leilão')`,
        [auction.buyer_id, auction_id]
      );

      // Busca informações completas do lance para retornar
      const fullBidResult = await client.query(
        `SELECT b.*, u.name as supplier_name, u.company_name as supplier_company
         FROM bids b
         JOIN users u ON b.supplier_id = u.id
         WHERE b.id = $1`,
        [bidResult.rows[0].id]
      );

      return fullBidResult.rows[0];
    });

    res.status(201).json({
      message: 'Lance criado com sucesso',
      bid: result
    });

    // Notifica via WebSocket
    broadcast(auction_id, 'new_bid', result);

  } catch (error) {
    console.error('Erro ao criar lance:', error);
    
    if (error.message.includes('não encontrado') || 
        error.message.includes('não está ativo') ||
        error.message.includes('já encerrado') ||
        error.message.includes('próprio leilão') ||
        error.message.includes('menor que')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Erro ao criar lance',
      details: error.message
    });
  }
};

// Listar lances de um leilão específico
exports.getBidsByAuction = async (req, res) => {
  const { auction_id } = req.params;

  try {
    const result = await query(
      `SELECT b.*, 
              u.name as supplier_name, 
              u.company_name as supplier_company,
              u.phone as supplier_phone
       FROM bids b
       JOIN users u ON b.supplier_id = u.id
       WHERE b.auction_id = $1 AND b.status = 'active'
       ORDER BY b.bid_amount ASC, b.created_at ASC`,
      [auction_id]
    );

    // Se o usuário for comprador, mostra todos os lances
    // Se for fornecedor, mostra apenas o seu lance e esconde informações dos outros
    let bids = result.rows;

    if (req.user.user_type === 'supplier') {
      bids = bids.map(bid => {
        if (bid.supplier_id !== req.user.id) {
          // Esconde informações sensíveis de outros fornecedores
          return {
            id: bid.id,
            auction_id: bid.auction_id,
            bid_amount: bid.bid_amount,
            created_at: bid.created_at,
            is_mine: false
          };
        }
        return { ...bid, is_mine: true };
      });
    }

    res.json({
      bids,
      total: bids.length
    });

  } catch (error) {
    console.error('Erro ao buscar lances:', error);
    res.status(500).json({
      error: 'Erro ao buscar lances',
      details: error.message
    });
  }
};

// Obter lance específico
exports.getBidById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT b.*, 
              u.name as supplier_name, 
              u.company_name as supplier_company,
              u.phone as supplier_phone,
              a.buyer_id
       FROM bids b
       JOIN users u ON b.supplier_id = u.id
       JOIN auctions a ON b.auction_id = a.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Lance não encontrado'
      });
    }

    const bid = result.rows[0];

    // Verifica permissão: apenas o fornecedor dono do lance ou o comprador do leilão
    if (bid.supplier_id !== req.user.id && bid.buyer_id !== req.user.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para ver este lance'
      });
    }

    res.json({ bid });

  } catch (error) {
    console.error('Erro ao buscar lance:', error);
    res.status(500).json({
      error: 'Erro ao buscar lance',
      details: error.message
    });
  }
};

// Listar lances do fornecedor autenticado
exports.getMyBids = async (req, res) => {
  const supplier_id = req.user.id;
  const { status } = req.query;

  try {
    let queryText = `
      SELECT b.*, 
             a.title as auction_title,
             a.status as auction_status,
             a.end_date as auction_end_date,
             a.current_price as auction_current_price,
             CASE 
               WHEN b.bid_amount = a.current_price THEN true
               ELSE false
             END as is_winning
      FROM bids b
      JOIN auctions a ON b.auction_id = a.id
      WHERE b.supplier_id = $1 AND b.status = 'active'
    `;

    const params = [supplier_id];

    if (status === 'winning') {
      queryText += ' AND b.bid_amount = a.current_price';
    } else if (status === 'losing') {
      queryText += ' AND b.bid_amount > a.current_price';
    }

    queryText += ' ORDER BY b.created_at DESC';

    const result = await query(queryText, params);

    res.json({
      bids: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao buscar meus lances:', error);
    res.status(500).json({
      error: 'Erro ao buscar seus lances',
      details: error.message
    });
  }
};

// Retirar lance (fornecedor pode retirar seu lance)
exports.withdrawBid = async (req, res) => {
  const { id } = req.params;
  const supplier_id = req.user.id;
  let eventPayload = {};

  try {
    // Usa transação para garantir consistência
    await transaction(async (client) => {
      // Verifica se o lance existe, pertence ao fornecedor e pega dados do leilão
      const bidResult = await client.query(
        `SELECT b.*, 
                a.status as auction_status, 
                a.current_price, 
                a.initial_price
         FROM bids b
         JOIN auctions a ON b.auction_id = a.id
         WHERE b.id = $1 AND b.supplier_id = $2`,
        [id, supplier_id]
      );

      if (bidResult.rows.length === 0) {
        throw new Error('Lance não encontrado ou você não tem permissão');
      }

      const bid = bidResult.rows[0];
      eventPayload.auction_id = bid.auction_id;
      eventPayload.withdrawn_bid_id = bid.id;

      // Verifica se o leilão ainda está ativo
      if (bid.auction_status !== 'active') {
        throw new Error('Não é possível retirar lance de leilão inativo');
      }

      // Marca o lance como retirado
      await client.query(
        "UPDATE bids SET status = 'withdrawn' WHERE id = $1",
        [id]
      );

      let new_current_price = bid.current_price;

      // Só atualiza o preço do leilão se o lance retirado era o vencedor
      if (bid.bid_amount === bid.current_price) {
        // Atualiza o preço atual do leilão para o próximo menor lance
        const nextBidResult = await client.query(
          `SELECT MIN(bid_amount) as next_price
           FROM bids
           WHERE auction_id = $1 AND status = 'active'`,
          [bid.auction_id]
        );

        const nextPrice = nextBidResult.rows[0]?.next_price;

        if (nextPrice) {
          new_current_price = nextPrice;
          await client.query(
            'UPDATE auctions SET current_price = $1 WHERE id = $2',
            [nextPrice, bid.auction_id]
          );
        } else {
          // Se não há mais lances, volta para null (ou preço inicial)
          new_current_price = null;
          await client.query(
            'UPDATE auctions SET current_price = NULL WHERE id = $1',
            [bid.auction_id]
          );
        }
      }
      eventPayload.new_current_price = new_current_price;
    });

    res.json({
      message: 'Lance retirado com sucesso'
    });

    // Notifica via WebSocket
    broadcast(eventPayload.auction_id, 'bid_withdrawn', eventPayload);

  } catch (error) {
    console.error('Erro ao retirar lance:', error);

    if (error.message.includes('não encontrado') || error.message.includes('inativo')) {
        return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Erro ao retirar lance',
      details: error.message
    });
  }
};

// Obter estatísticas de lances de um leilão
exports.getBidStatistics = async (req, res) => {
  const { auction_id } = req.params;

  try {
    const result = await query(
      `SELECT 
         COUNT(*) as total_bids,
         MIN(bid_amount) as lowest_bid,
         MAX(bid_amount) as highest_bid,
         AVG(bid_amount) as average_bid,
         COUNT(DISTINCT supplier_id) as total_suppliers
       FROM bids
       WHERE auction_id = $1 AND status = 'active'`,
      [auction_id]
    );

    res.json({
      statistics: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      details: error.message
    });
  }
};