// controllers/notificationController.js
const { query } = require('../config/database');

// Listar notificações do usuário autenticado
exports.getNotifications = async (req, res) => {
  const user_id = req.user.id;
  const { is_read, limit = 50, offset = 0 } = req.query;

  try {
    let queryText = `
      SELECT n.*, 
             a.title as auction_title,
             a.status as auction_status
      FROM notifications n
      LEFT JOIN auctions a ON n.auction_id = a.id
      WHERE n.user_id = $1
    `;

    const params = [user_id];
    let paramCount = 2;

    // Filtro por status de leitura
    if (is_read !== undefined) {
      const isReadBool = is_read === 'true';
      queryText += ` AND n.is_read = $${paramCount}`;
      params.push(isReadBool);
      paramCount++;
    }

    queryText += ` ORDER BY n.created_at DESC`;

    // Paginação
    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Conta o total de notificações
    const countResult = await query(
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = $1`,
      [user_id]
    );

    res.json({
      notifications: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({
      error: 'Erro ao buscar notificações',
      details: error.message
    });
  }
};

// Obter contagem de notificações não lidas
exports.getUnreadCount = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await query(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [user_id]
    );

    res.json({
      unread_count: parseInt(result.rows[0].unread_count)
    });

  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    res.status(500).json({
      error: 'Erro ao contar notificações não lidas',
      details: error.message
    });
  }
};

// Marcar notificação como lida
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Verifica se a notificação existe e pertence ao usuário
    const checkResult = await query(
      'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Notificação não encontrada'
      });
    }

    // Marca como lida
    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );

    res.json({
      message: 'Notificação marcada como lida',
      notification: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      error: 'Erro ao marcar notificação como lida',
      details: error.message
    });
  }
};

// Marcar todas as notificações como lidas
exports.markAllAsRead = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [user_id]
    );

    res.json({
      message: 'Todas as notificações foram marcadas como lidas',
      updated_count: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    res.status(500).json({
      error: 'Erro ao marcar todas as notificações como lidas',
      details: error.message
    });
  }
};

// Deletar uma notificação específica
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Verifica se a notificação existe e pertence ao usuário
    const checkResult = await query(
      'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Notificação não encontrada'
      });
    }

    // Deleta a notificação
    await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    res.json({
      message: 'Notificação deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({
      error: 'Erro ao deletar notificação',
      details: error.message
    });
  }
};

// Deletar todas as notificações do usuário
exports.deleteAllNotifications = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await query(
      'DELETE FROM notifications WHERE user_id = $1 RETURNING id',
      [user_id]
    );

    res.json({
      message: 'Todas as notificações foram deletadas',
      deleted_count: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao deletar todas as notificações:', error);
    res.status(500).json({
      error: 'Erro ao deletar todas as notificações',
      details: error.message
    });
  }
};

// Criar notificação (função auxiliar para ser usada internamente)
exports.createNotification = async (user_id, auction_id, type, message) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, auction_id, type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, auction_id, type, message]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

// Criar notificações em lote (útil para notificar múltiplos usuários)
exports.createBulkNotifications = async (notifications) => {
  try {
    // notifications = [{ user_id, auction_id, type, message }, ...]
    const values = [];
    const placeholders = [];
    
    notifications.forEach((notif, index) => {
      const offset = index * 4;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      values.push(notif.user_id, notif.auction_id, notif.type, notif.message);
    });

    const queryText = `
      INSERT INTO notifications (user_id, auction_id, type, message)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await query(queryText, values);
    return result.rows;
  } catch (error) {
    console.error('Erro ao criar notificações em lote:', error);
    throw error;
  }
};