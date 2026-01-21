const { query, transaction } = require('../config/database');
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

// Fechar um leilão, determinar o vencedor e notificar
exports.closeAuction = async (req, res) => {
    const { id: auctionId } = req.params;
    const buyerId = req.user.id;

    try {
        const result = await transaction(async (client) => {
            // 1. Validar se o leilão existe, pertence ao usuário e está ativo
            const auctionResult = await client.query(
                `SELECT id, title, status FROM auctions WHERE id = $1 AND buyer_id = $2`,
                [auctionId, buyerId]
            );

            if (auctionResult.rows.length === 0) {
                throw new Error('Leilão não encontrado ou você não tem permissão para fechá-lo.');
            }

            const auction = auctionResult.rows[0];
            if (auction.status !== 'active') {
                throw new Error('Este leilão não está mais ativo.');
            }

            // 2. Buscar todos os lances ativos para este leilão
            const bidsResult = await client.query(
                `SELECT id, supplier_id, bid_amount 
                 FROM bids 
                 WHERE auction_id = $1 AND status = 'active'
                 ORDER BY bid_amount ASC`,
                [auctionId]
            );

            const bids = bidsResult.rows;
            if (bids.length === 0) {
                // Se não houver lances, fechar sem vencedor
                const updatedAuction = await client.query(
                    `UPDATE auctions SET status = 'closed_without_winner' WHERE id = $1 RETURNING *`,
                    [auctionId]
                );
                return { updatedAuction: updatedAuction.rows[0], message: 'Leilão fechado sem lances.' };
            }

            // 3. Lógica para encontrar o menor lance único
            const bidCounts = bids.reduce((acc, bid) => {
                acc[bid.bid_amount] = (acc[bid.bid_amount] || 0) + 1;
                return acc;
            }, {});

            const uniqueBids = bids.filter(bid => bidCounts[bid.bid_amount] === 1);

            let winningBid = null;
            if (uniqueBids.length > 0) {
                // O primeiro da lista ordenada é o menor
                winningBid = uniqueBids[0];
            }

            let updatedAuction;
            let message;

            if (winningBid) {
                // 4. Se houver um vencedor
                message = `Leilão fechado! O vencedor é o fornecedor ID ${winningBid.supplier_id} com um lance de ${winningBid.bid_amount}.`;

                // Atualizar o leilão com o vencedor
                updatedAuction = (await client.query(
                    `UPDATE auctions 
                     SET status = 'closed', winner_id = $1, winning_bid_id = $2, current_price = $3
                     WHERE id = $4
                     RETURNING *`,
                    [winningBid.supplier_id, winningBid.id, winningBid.bid_amount, auctionId]
                )).rows[0];

                // Notificar o vencedor
                await client.query(
                    `INSERT INTO notifications (user_id, auction_id, type, message)
                     VALUES ($1, $2, 'auction_won', $3)`,
                    [winningBid.supplier_id, auctionId, `Parabéns! Você venceu o leilão "${auction.title}" com um lance de ${winningBid.bid_amount}.`]
                );

                // Notificar os perdedores
                const losers = bids.filter(bid => bid.supplier_id !== winningBid.supplier_id);
                const loserIds = [...new Set(losers.map(l => l.supplier_id))]; // Evita múltiplas notificações para o mesmo perdedor
                
                for (const loserId of loserIds) {
                    await client.query(
                        `INSERT INTO notifications (user_id, auction_id, type, message)
                         VALUES ($1, $2, 'auction_lost', $3)`,
                        [loserId, auctionId, `O leilão "${auction.title}" foi encerrado. Infelizmente, seu lance não foi o vencedor.`]
                    );
                }

            } else {
                // 5. Se não houver vencedor
                message = 'Leilão fechado, mas não houve um lance único. Nenhum vencedor foi determinado.';
                updatedAuction = (await client.query(
                    `UPDATE auctions SET status = 'closed_without_winner' WHERE id = $1 RETURNING *`,
                    [auctionId]
                )).rows[0];

                // Notificar todos os participantes que não houve vencedor
                const participantIds = [...new Set(bids.map(b => b.supplier_id))];
                for (const participantId of participantIds) {
                    await client.query(
                        `INSERT INTO notifications (user_id, auction_id, type, message)
                         VALUES ($1, $2, 'no_winner', $3)`,
                        [participantId, auctionId, `O leilão "${auction.title}" foi encerrado sem um vencedor, pois não houve lances únicos.`]
                    );
                }
            }
            
            return { updatedAuction, message };
        });

        res.json(result);

    } catch (error) {
        console.error('Erro ao fechar leilão:', error);
        res.status(500).json({ error: 'Erro interno ao tentar fechar o leilão.', details: error.message });
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