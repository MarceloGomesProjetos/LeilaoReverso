const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const notificationRoutes = require('./routes/notifications');
const webSocket = require('./utils/websocket');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);

// Inicializa o WebSocket Server
webSocket.init(server);

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/notifications', notificationRoutes);

db.testConnection(); // Testa a conexão ao iniciar

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
