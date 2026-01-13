const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// WebSocket para lances em tempo real
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'join-auction') {
      if (!clients.has(data.auctionId)) {
        clients.set(data.auctionId, new Set());
      }
      clients.get(data.auctionId).add(ws);
    }
    
    if (data.type === 'new-bid') {
      const auctionClients = clients.get(data.auctionId);
      if (auctionClients) {
        auctionClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'bid-update',
              data: data.payload
            }));
          }
        });
      }
    }
  });
  
  ws.on('close', () => {
    clients.forEach((clientSet) => {
      clientSet.delete(ws);
    });
    console.log('Cliente desconectado');
  });
});

db.testConnection(); // Testa a conexão ao iniciar

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
