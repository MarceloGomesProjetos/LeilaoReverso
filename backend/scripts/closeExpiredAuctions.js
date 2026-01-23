// backend/scripts/closeExpiredAuctions.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { query } = require('../config/database');
const auctionService = require('../services/auctionService');

const closeExpiredAuctions = async () => {
    console.log('Iniciando verificação de leilões expirados...');

    let client; // Manter o cliente fora do try/catch para o finally
    try {
        // Não precisamos de uma transação completa aqui, pois cada leilão é fechado em sua própria transação.
        // Usamos 'query' que gerencia o pool de conexões.
        const result = await query(
            `SELECT id FROM auctions WHERE status = 'active' AND end_date <= NOW()`
        );

        const expiredAuctions = result.rows;

        if (expiredAuctions.length === 0) {
            console.log('Nenhum leilão expirado encontrado.');
            return;
        }

        console.log(`Encontrados ${expiredAuctions.length} leilões expirados. Processando...`);

        for (const auction of expiredAuctions) {
            try {
                console.log(`- Fechando leilão ID: ${auction.id}...`);
                // O segundo argumento é undefined pois é um processo automático, não vindo de um usuário específico.
                const closeResult = await auctionService.closeAuctionById(auction.id);
                console.log(`  - ${closeResult.message}`);
            } catch (error) {
                console.error(`  - Erro ao fechar o leilão ID ${auction.id}:`, error.message);
                // Continua para o próximo leilão mesmo se um falhar
            }
        }

        console.log('Verificação de leilões expirados concluída.');

    } catch (error) {
        console.error('Erro fatal durante o processo de fechamento de leilões expirados:', error);
    }
};

// Se o script for executado diretamente, chame a função.
if (require.main === module) {
    closeExpiredAuctions().finally(() => {
        // Se o seu pool de conexão tiver um método de encerramento, considere chamá-lo aqui
        // se o script for projetado para sair. Ex: pool.end();
        // Neste caso, como o pool é global, não vamos encerrá-lo.
    });
}

module.exports = closeExpiredAuctions;
