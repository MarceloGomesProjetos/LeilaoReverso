const { query } = require('../config/database');

/**
 * Módulo de IA para o Vibe Code
 */

// 1. Detecção de Fraude (Bot Detection)
// Analisa se o intervalo entre o novo lance e o anterior é humano ou robótico
exports.detectBotBehavior = async (auctionId, supplierId) => {
  // Busca o último lance deste fornecedor neste leilão
  const lastBidResult = await query(
    `SELECT created_at FROM bids 
     WHERE auction_id = $1 AND supplier_id = $2 
     ORDER BY created_at DESC LIMIT 1`,
    [auctionId, supplierId]
  );

  if (lastBidResult.rows.length === 0) return false;

  const lastBidTime = new Date(lastBidResult.rows[0].created_at).getTime();
  const currentTime = Date.now();
  const timeDiff = currentTime - lastBidTime;

  // Se o intervalo for menor que 500ms, marcamos como comportamento suspeito (Bot)
  const IS_BOT_THRESHOLD = 500; 
  return timeDiff < IS_BOT_THRESHOLD;
};

// 2. Sugestão de Lance Estratégico (Bid Recommender)
// Analisa a média e o preço atual para sugerir um valor competitivo
exports.generateStrategicBid = async (auctionId) => {
  const stats = await query(
    `SELECT current_price, initial_price, 
     (SELECT AVG(bid_amount) FROM bids WHERE auction_id = $1) as avg_bid
     FROM auctions WHERE id = $1`,
    [auctionId]
  );

  if (stats.rows.length === 0) return null;

  const { current_price, initial_price, avg_bid } = stats.rows[0];
  const referencePrice = current_price || initial_price;

  // Lógica simples de regressão: sugere um lance 1% menor que o atual, 
  // mas ajustado se a média estiver muito distante (agressividade do leilão)
  let suggestion = referencePrice * 0.99; 

  if (avg_bid && suggestion > avg_bid) {
    suggestion = parseFloat(avg_bid) * 0.98; // Se o leilão está concorrido, sugere ser mais agressivo
  }

  return parseFloat(suggestion.toFixed(2));
};

// 3. Geração de Relatório Pós-Leilão (Analytics)
exports.generateAuctionReport = async (auctionId) => {
  // Coleta todos os dados necessários em uma única consulta (ou múltiplas se necessário)
  const auctionData = await query(
    `SELECT 
        a.title as auction_title, a.end_date, a.initial_price, a.current_price, a.category,
        (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as total_bids,
        (SELECT u.name FROM users u JOIN bids b ON u.id = b.supplier_id WHERE b.auction_id = a.id AND b.bid_amount = a.current_price LIMIT 1) as winner_name,
        a.current_price as winner_bid
     FROM auctions a
     WHERE a.id = $1`,
    [auctionId]
  );

  if (auctionData.rows.length === 0) return null;

  const { auction_title, end_date, initial_price, current_price, category, total_bids, winner_name, winner_bid } = auctionData.rows[0];
  
  const savings = initial_price - current_price;
  const savings_percent = ((savings / initial_price) * 100).toFixed(2);
  
  // Lógica simples para score de risco (ex: leilões com poucos lances são mais arriscados)
  const risk_score = total_bids < 3 ? 7 : (total_bids < 5 ? 5 : 3);

  return {
    auction_title,
    end_date,
    savings,
    savings_percent,
    total_bids,
    risk_score,
    recommended_supplier: {
      name: winner_name || 'N/A',
      bid_amount: winner_bid || 0
    },
    category
  };
};