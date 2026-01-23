// backend/services/notificationService.js

/**
 * Cria uma nova notificação dentro de uma transação.
 * @param {object} client O cliente de banco de dados da transação.
 * @param {number} userId O ID do usuário a ser notificado.
 * @param {number} auctionId O ID do leilão relacionado.
 * @param {string} type O tipo de notificação (ex: 'auction_won', 'auction_lost').
 * @param {string} message A mensagem da notificação.
 */
const createNotification = async (client, userId, auctionId, type, message) => {
  try {
    await client.query(
      `INSERT INTO notifications (user_id, auction_id, type, message, is_read)
       VALUES ($1, $2, $3, $4, false)`,
      [userId, auctionId, type, message]
    );
  } catch (error) {
    // É importante logar o erro, mas talvez não seja necessário parar toda a transação por uma falha de notificação.
    // Depende da regra de negócio. Por enquanto, vamos logar.
    console.error(`Erro ao criar notificação para o usuário ${userId} no leilão ${auctionId}:`, error);
    // Opcional: relançar o erro se uma notificação for crítica para a transação.
    // throw error; 
  }
};

module.exports = { createNotification };
