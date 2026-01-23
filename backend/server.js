const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const notificationRoutes = require('./routes/notifications');
const webSocket = require('./utils/websocket');
const db = require('./config/database');
const cron = require('node-cron');
const closeExpiredAuctions = require('./scripts/closeExpiredAuctions');

const app = express();
const server = http.createServer(app);

// Inicializa o WebSocket Server
webSocket.init(server);

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/notifications', notificationRoutes);

// Tarefa agendada para fechar leilões expirados a cada minuto
cron.schedule('* * * * *', () => {
    console.log('Executando a tarefa agendada: fechamento de leilões expirados.');
    closeExpiredAuctions();
});

db.testConnection(); // Testa a conexão ao iniciar

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
