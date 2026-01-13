import React, { useState } from 'react';
import './index.css';
import { FileText, Database, Smartphone, Server, Code, BookOpen, Activity } from 'lucide-react';

const ReverseAuctionDocs = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BookOpen },
    { id: 'database', label: 'Banco de Dados', icon: Database },
    { id: 'backend', label: 'Backend', icon: Server },
    { id: 'flutter', label: 'Flutter App', icon: Smartphone },
    { id: 'features', label: 'Funcionalidades', icon: Code },
    { id: 'test', label: 'Teste API', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Sistema de Leilão Reverso
          </h1>
          <p className="text-gray-600">
            Plataforma completa com Flutter (Mobile) e PostgreSQL
          </p>
        </header>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-indigo-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Visão Geral do Sistema</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-blue-900 mb-2">O que é Leilão Reverso?</h3>
                <p className="text-gray-700">
                  No leilão reverso, o comprador publica uma demanda (produto/serviço) e os fornecedores 
                  competem oferecendo lances com preços cada vez menores. O fornecedor com o menor preço vence.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Arquitetura</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong>Frontend:</strong> Flutter (iOS/Android)</li>
                    <li>• <strong>Backend:</strong> Node.js + Express</li>
                    <li>• <strong>Banco de Dados:</strong> PostgreSQL</li>
                    <li>• <strong>Tempo Real:</strong> WebSockets</li>
                    <li>• <strong>Autenticação:</strong> JWT</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Funcionalidades Principais</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Cadastro de usuários (Comprador/Fornecedor)</li>
                    <li>• Criação de leilões com prazo</li>
                    <li>• Sistema de lances em tempo real</li>
                    <li>• Notificações push</li>
                    <li>• Histórico de leilões</li>
                    <li>• Chat entre comprador e fornecedor</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6">
                <h3 className="font-bold text-yellow-900 mb-2">Próximos Passos</h3>
                <p className="text-gray-700 mb-2">
                  Para implementar este sistema, siga as abas na ordem:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Configure o banco de dados PostgreSQL</li>
                  <li>Implemente o backend Node.js</li>
                  <li>Desenvolva o app Flutter</li>
                  <li>Teste as funcionalidades integradas</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Estrutura do Banco de Dados</h2>
              
              <div className="bg-gray-800 text-gray-100 p-6 rounded-lg overflow-x-auto">
                <pre className="text-sm">{`-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'supplier')),
    phone VARCHAR(20),
    company_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Leilões
CREATE TABLE auctions (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    initial_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
    winning_bid_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Lances
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10,2) NOT NULL,
    delivery_days INTEGER,
    comments TEXT,
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'withdrawn', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(auction_id, supplier_id)
);

-- Tabela de Notificações
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mensagens (Chat)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_auctions_buyer ON auctions(buyer_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_date ON auctions(end_date);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_supplier ON bids(supplier_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_messages_auction ON messages(auction_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`}</pre>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-bold text-green-900 mb-2">Comandos de Setup</h3>
                <div className="bg-gray-800 text-gray-100 p-4 rounded mt-2">
                  <pre className="text-sm">{`# Criar banco de dados
createdb reverse_auction

# Executar script SQL
psql -d reverse_auction -f schema.sql

# Ou usando Docker
docker run --name postgres-auction \\
  -e POSTGRES_PASSWORD=senha123 \\
  -e POSTGRES_DB=reverse_auction \\
  -p 5432:5432 -d postgres:15`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend API (Node.js)</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">1. Instalação de Dependências</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded">
                    <pre className="text-sm">{`npm init -y
npm install express pg bcryptjs jsonwebtoken cors dotenv ws
npm install --save-dev nodemon`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">1.5. Arquivo web/index.html (Opcional - Para Web)</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
                    <pre className="text-sm">{`<!DOCTYPE html>
<html>
<head>
  <base href="$FLUTTER_BASE_HREF">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leilão Reverso</title>
  
  <style>
    /* Reset básico */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                   Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Loading spinner */
    .loading-container {
      text-align: center;
      color: white;
    }

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 18px;
      font-weight: 500;
    }

    /* Flutter app container */
    #flutter-view {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div class="loading-container" id="loading">
    <div class="spinner"></div>
    <div class="loading-text">Carregando Leilão Reverso...</div>
  </div>
  
  <script src="flutter.js" defer></script>
</body>
</html>`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">2. Estrutura do Projeto</h3>
                  <div className="bg-gray-100 p-4 rounded">
                    <pre className="text-sm">{`backend/
├── server.js
├── .env
├── config/
│   └── database.js
├── routes/
│   ├── auth.js
│   ├── auctions.js
│   ├── bids.js
│   └── notifications.js
├── controllers/
│   ├── authController.js
│   ├── auctionController.js
│   └── bidController.js
├── middleware/
│   └── auth.js
└── utils/
    └── websocket.js`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">3. server.js (Principal)</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
                    <pre className="text-sm">{`const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`Servidor rodando na porta \${PORT}\`);
});`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">4. Arquivo .env</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded">
                    <pre className="text-sm">{`PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reverse_auction
DB_USER=postgres
DB_PASSWORD=senha123
JWT_SECRET=seu_secret_key_aqui`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">5. Controllers Principais</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
                    <pre className="text-sm">{`// controllers/auctionController.js
const pool = require('../config/database');

exports.createAuction = async (req, res) => {
  const { title, description, category, initial_price, end_date } = req.body;
  const buyer_id = req.user.id;
  
  try {
    const result = await pool.query(
      \`INSERT INTO auctions 
       (buyer_id, title, description, category, initial_price, 
        current_price, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $5, NOW(), $6, 'active')
       RETURNING *\`,
      [buyer_id, title, description, category, initial_price, end_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveAuctions = async (req, res) => {
  try {
    const result = await pool.query(
      \`SELECT a.*, u.company_name as buyer_company,
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bid_count
       FROM auctions a
       JOIN users u ON a.buyer_id = u.id
       WHERE a.status = 'active' AND a.end_date > NOW()
       ORDER BY a.created_at DESC\`
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flutter' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Aplicativo Flutter</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">0. Observação Importante</h3>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                    <p className="text-gray-700">
                      <strong>Nota:</strong> Flutter não usa arquivos CSS. O styling é feito diretamente no código Dart usando widgets e propriedades.
                      Para web styling (se necessário), você pode adicionar um arquivo <code>web/index.html</code> com CSS inline ou externo.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">1. Dependências (pubspec.yaml)</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded">
                    <pre className="text-sm">{`dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  provider: ^6.1.1
  web_socket_channel: ^2.4.0
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  intl: ^0.18.1
  flutter_local_notifications: ^16.3.0`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">2. Estrutura do Projeto</h3>
                  <div className="bg-gray-100 p-4 rounded">
                    <pre className="text-sm">{`lib/
├── main.dart
├── models/
│   ├── user.dart
│   ├── auction.dart
│   └── bid.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   └── socket_service.dart
├── providers/
│   ├── auth_provider.dart
│   └── auction_provider.dart
└── screens/
    ├── login_screen.dart
    ├── register_screen.dart
    ├── home_screen.dart
    ├── auction_list_screen.dart
    ├── auction_detail_screen.dart
    └── create_auction_screen.dart`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">3. main.dart</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
                    <pre className="text-sm">{`import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/auction_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AuctionProvider()),
      ],
      child: MaterialApp(
        title: 'Leilão Reverso',
        theme: ThemeData(
          primarySwatch: Colors.indigo,
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            return auth.isAuthenticated 
              ? const HomeScreen() 
              : const LoginScreen();
          },
        ),
      ),
    );
  }
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">4. Models</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
                    <pre className="text-sm">{`// models/auction.dart
class Auction {
  final int id;
  final String title;
  final String description;
  final String category;
  final double initialPrice;
  final double? currentPrice;
  final DateTime startDate;
  final DateTime endDate;
  final String status;
  final int bidCount;
  final String buyerCompany;

  Auction({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.initialPrice,
    this.currentPrice,
    required this.startDate,
    required this.endDate,
    required this.status,
    this.bidCount = 0,
    required this.buyerCompany,
  });

  factory Auction.fromJson(Map<String, dynamic> json) {
    return Auction(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      category: json['category'] ?? '',
      initialPrice: double.parse(json['initial_price'].toString()),
      currentPrice: json['current_price'] != null 
        ? double.parse(json['current_price'].toString())
        : null,
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      status: json['status'],
      bidCount: json['bid_count'] ?? 0,
      buyerCompany: json['buyer_company'] ?? '',
    );
  }
}

// models/bid.dart
class Bid {
  final int id;
  final int auctionId;
  final int supplierId;
  final double bidAmount;
  final int? deliveryDays;
  final String? comments;
  final DateTime createdAt;

  Bid({
    required this.id,
    required this.auctionId,
    required this.supplierId,
    required this.bidAmount,
    this.deliveryDays,
    this.comments,
    required this.createdAt,
  });

  factory Bid.fromJson(Map<String, dynamic> json) {
    return Bid(
      id: json['id'],
      auctionId: json['auction_id'],
      supplierId: json['supplier_id'],
      bidAmount: double.parse(json['bid_amount'].toString()),
      deliveryDays: json['delivery_days'],
      comments: json['comments'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">5. API Service</h3>
                  <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
                    <pre className="text-sm">{`// services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  
  static Future<List<dynamic>> getActiveAuctions(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/auctions/active'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Falha ao carregar leilões');
    }
  }
  
  static Future<Map<String, dynamic>> createBid({
    required String token,
    required int auctionId,
    required double bidAmount,
    int? deliveryDays,
    String? comments,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/bids'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'auction_id': auctionId,
        'bid_amount': bidAmount,
        'delivery_days': deliveryDays,
        'comments': comments,
      }),
    );
    
    if (response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Falha ao criar lance');
    }
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Funcionalidades Implementadas</h2>
              
              <div className="grid gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-indigo-900 mb-3">✓ Autenticação e Autorização</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Login/Registro com JWT</li>
                    <li>• Separação de perfis (Comprador/Fornecedor)</li>
                    <li>• Token persistente com refresh</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-indigo-900 mb-3">✓ Gestão de Leilões</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Criar leilão com prazo definido</li>
                    <li>• Listar leilões ativos e finalizados</li>
                    <li>• Filtrar por categoria e status</li>
                    <li>• Visualizar detalhes e histórico</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-indigo-900 mb-3">✓ Sistema de Lances</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Fornecedores enviam lances (preços decrescentes)</li>
                    <li>• Validação de lance menor que atual</li>
                    <li>• Atualização em tempo real via WebSocket</li>
                    <li>• Ranking de melhores lances</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-indigo-900 mb-3">✓ Notificações</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Novo lance recebido</li>
                    <li>• Leilão prestes a encerrar</li>
                    <li>• Leilão vencido/perdido</li>
                    <li>• Push notifications no app</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-indigo-900 mb-3">⚙️ Recursos Adicionais</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Interface responsiva e intuitiva</li>
                    <li>• Contador regressivo de tempo</li>
                    <li>• Histórico de participações</li>
                    <li>• Sistema de avaliações (futuro)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded mt-6">
                <h3 className="font-bold text-indigo-900 mb-2">Melhorias Futuras</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Sistema de pagamento integrado</li>
                  <li>• Chat direto entre comprador e fornecedor</li>
                  <li>• Upload de anexos/documentos</li>
                  <li>• Relatórios e analytics</li>
                  <li>• Sistema de reputação</li>
                  <li>• Integração com e-mail</li>
                  <li>• Múltiplas moedas</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Teste de Integração</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Para testar a integração, certifique-se de que seu backend está rodando localmente na porta 3000.
                  O botão abaixo fará uma requisição para <code>http://localhost:3000/api/auctions/active</code>.
                </p>
                
                <button
                  onClick={async () => {
                    setIsTesting(true);
                    setTestResult(null);
                    try {
                      const res = await fetch('http://localhost:3000/api/auctions/active');
                      const data = await res.json();
                      setTestResult(JSON.stringify(data, null, 2));
                    } catch (e: any) {
                      setTestResult('Erro ao conectar: ' + e.toString() + '\n\nDica: Verifique se o backend está rodando e se o CORS está habilitado.');
                    } finally {
                      setIsTesting(false);
                    }
                  }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 font-medium"
                  disabled={isTesting}
                >
                  {isTesting ? 'Testando...' : 'Testar Conexão com Backend'}
                </button>

                {testResult && (
                  <div className="mt-6">
                    <h3 className="font-bold text-gray-900 mb-2">Resultado da API:</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">{testResult}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="mt-6 text-center text-gray-600 text-sm">
          <p>Sistema de Leilão Reverso - Desenvolvido com Flutter, Node.js e PostgreSQL</p>
        </footer>
      </div>
    </div>
  );
};

export default ReverseAuctionDocs;