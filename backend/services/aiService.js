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