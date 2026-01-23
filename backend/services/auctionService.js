const { transaction } = require('../config/database');
const notificationService = require('./notificationService'); // Supondo que teremos um serviço de notificação

/**
 * Fecha um leilão, determina o vencedor e notifica os participantes.
 * @param {number} auctionId O ID do leilão a ser fechado.
 * @param {number} [userId] O ID do usuário que está tentando fechar o leilão (opcional, para verificação de permissão).
 */
const closeAuctionById = async (auctionId, userId) => {
    return transaction(async (client) => {
        // 1. Validar se o leilão existe e está ativo. Se um userId for fornecido, também valida a permissão.
        const auctionQuery = userId
            ? `SELECT id, title, status FROM auctions WHERE id = $1 AND buyer_id = $2`
            : `SELECT id, title, status FROM auctions WHERE id = $1`;
        const auctionParams = userId ? [auctionId, userId] : [auctionId];
        
        const auctionResult = await client.query(auctionQuery, auctionParams);

        if (auctionResult.rows.length === 0) {
            if (userId) throw new Error('Leilão não encontrado ou você não tem permissão para fechá-lo.');
            throw new Error('Leilão não encontrado.');
        }

        const auction = auctionResult.rows[0];
        if (auction.status !== 'active') {
            // Se o leilão não está ativo, consideramos que a operação já foi concluída ou não é mais necessária.
            // Isso evita erros em execuções automáticas repetidas.
            console.log(`Leilão ID ${auctionId} já se encontra no estado '${auction.status}'. Nenhuma ação necessária.`);
            return { updatedAuction: auction, message: `O leilão já está no estado '${auction.status}'.` };
        }

        // 2. Buscar todos os lances ativos para este leilão
        const bidsResult = await client.query(
            `SELECT b.id, b.supplier_id, b.bid_amount, u.company_name
             FROM bids b
             JOIN users u ON b.supplier_id = u.id
             WHERE b.auction_id = $1 AND b.status = 'active'
             ORDER BY b.bid_amount ASC, b.created_at ASC`, // Adicionado created_at para desempate
            [auctionId]
        );

        const bids = bidsResult.rows;
        if (bids.length === 0) {
            // Se não houver lances, fechar sem vencedor
            const updatedAuction = (await client.query(
                `UPDATE auctions SET status = 'closed_without_winner' WHERE id = $1 RETURNING *`,
                [auctionId]
            )).rows[0];
            // @TODO: Notificar o dono do leilão que fechou sem lances.
            return { updatedAuction, message: 'Leilão fechado sem lances.' };
        }

        // 3. Lógica para encontrar o menor lance único
        const bidCounts = bids.reduce((acc, bid) => {
            const amount = bid.bid_amount.toString(); // Usar string para evitar problemas com ponto flutuante
            acc[amount] = (acc[amount] || 0) + 1;
            return acc;
        }, {});

        const uniqueBids = bids.filter(bid => bidCounts[bid.bid_amount.toString()] === 1);

        let winningBid = uniqueBids.length > 0 ? uniqueBids[0] : null;

        let updatedAuction;
        let message;

        if (winningBid) {
            // 4. Se houver um vencedor
            message = `Leilão fechado! O vencedor é ${winningBid.company_name} com um lance de R$ ${winningBid.bid_amount}.`;

            updatedAuction = (await client.query(
                `UPDATE auctions 
                 SET status = 'closed', winner_id = $1, winning_bid_id = $2, current_price = $3
                 WHERE id = $4
                 RETURNING *`,
                [winningBid.supplier_id, winningBid.id, winningBid.bid_amount, auctionId]
            )).rows[0];
            
            // Notificações
            await notificationService.createNotification(client, winningBid.supplier_id, auctionId, 'auction_won', 
                `Parabéns! Você venceu o leilão "${auction.title}" com um lance de R$ ${winningBid.bid_amount}.`
            );

            const loserIds = [...new Set(bids.filter(b => b.supplier_id !== winningBid.supplier_id).map(l => l.supplier_id))];
            for (const loserId of loserIds) {
                await notificationService.createNotification(client, loserId, auctionId, 'auction_lost',
                    `O leilão "${auction.title}" foi encerrado. Infelizmente, seu lance não foi o vencedor.`
                );
            }

        } else {
            // 5. Se não houver vencedor
            message = 'Leilão fechado, mas não houve um lance único. Nenhum vencedor foi determinado.';
            updatedAuction = (await client.query(
                `UPDATE auctions SET status = 'closed_without_winner' WHERE id = $1 RETURNING *`,
                [auctionId]
            )).rows[0];

            const participantIds = [...new Set(bids.map(b => b.supplier_id))];
            for (const participantId of participantIds) {
                await notificationService.createNotification(client, participantId, auctionId, 'no_winner',
                    `O leilão "${auction.title}" foi encerrado sem um vencedor, pois não houve lances únicos.`
                );
            }
        }
        
        // @TODO: Notificar o dono do leilão sobre o resultado.

        return { updatedAuction, message };
    });
};

module.exports = { closeAuctionById };
