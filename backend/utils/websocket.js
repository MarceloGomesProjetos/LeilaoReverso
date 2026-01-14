const WebSocket = require('ws');

let wss;
const clients = new Map();

const init = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Cliente conectado');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
        
            if (data.type === 'join-auction' && data.auctionId) {
                if (!clients.has(data.auctionId)) {
                    clients.set(data.auctionId, new Set());
                }
                clients.get(data.auctionId).add(ws);
                console.log(`Cliente entrou na sala do leilão ${data.auctionId}`);
            }
        } catch (error) {
            console.error('Erro ao processar mensagem ws:', error);
        }
    });

    ws.on('close', () => {
      clients.forEach((clientSet, auctionId) => {
        if (clientSet.delete(ws)) {
            console.log(`Cliente removido da sala do leilão ${auctionId}`);
        }
      });
      console.log('Cliente desconectado');
    });

    ws.on('error', (error) => {
        console.error('Erro no WebSocket:', error);
    });
  });

  return wss;
};

const getWss = () => {
  if (!wss) {
    throw new Error('WebSocket server not initialized!');
  }
  return wss;
};

const broadcast = (auctionId, type, payload) => {
    const auctionClients = clients.get(auctionId);
    if (auctionClients) {
        const message = JSON.stringify({ type, payload });
        auctionClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
};

module.exports = { init, getWss, broadcast };
