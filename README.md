# Leilão Reverso

Leilão Reverso é um sistema de leilões onde o menor lance vence. Este repositório contém uma aplicação full-stack com backend em Node.js/Express e frontend em React com Vite (TypeScript). O backend também oferece suporte a WebSocket para atualização de lances em tempo real.

---

## Índice

- [Visão Geral](#visão-geral)
- [Features](#features)
- [Tecnologias](#tecnologias)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Executando a aplicação](#executando-a-aplicação)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API principal](#api-principal)
- [WebSocket (Tempo real)](#websocket-tempo-real)
- [Banco de dados](#banco-de-dados)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Visão Geral

Este projeto implementa um sistema de Leilão Reverso com as seguintes funcionalidades principais:
- Cadastro e autenticação de usuários com JWT.
- Criação, listagem e visualização de leilões.
- Sistema de lances onde o menor lance único é o vencedor.
- Notificações e atualização de lances em tempo real via WebSocket.

---

## Features

- **Autenticação de Usuários:** Sistema completo de registro e login com validação de dados e tokens JWT para segurança.
- **Listagem de Leilões:** Página inicial que exibe os leilões ativos, permitindo que os usuários vejam as oportunidades disponíveis.
- **Sala de Leilão:** Página dedicada para cada leilão, onde os usuários podem dar seus lances. (Futura implementação)
- **Lances em Tempo Real:** Os lances são processados e atualizados em tempo real para todos os participantes do leilão usando WebSockets.
- **Notificações:** Sistema de notificações instantâneas (usando `react-hot-toast`) para feedback do usuário (e.g., sucesso ao fazer login, erros).
- **Design Moderno:** Interface de usuário limpa e responsiva construída com React, Tailwind CSS e ícones da biblioteca `lucide-react`.

---

## Tecnologias

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Banco de Dados:** PostgreSQL
- **WebSockets:** `ws`
- **Autenticação:** `jsonwebtoken` (JWT)
- **ORM/Driver:** `pg`

### Frontend
- **Framework:** React com Vite
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Roteamento:** `react-router-dom`
- **Comunicação HTTP:** `axios`
- **Comunicação Real-time:** `socket.io-client`
- **Notificações:** `react-hot-toast`
- **Ícones:** `lucide-react`

---

## Estrutura do Repositório

- **/backend**: Contém a API RESTful e o servidor WebSocket.
- **/frontend**: Contém a aplicação cliente em React.
- **.gitignore**: Arquivos e pastas a serem ignorados pelo Git.
- **README.md**: Este arquivo.

---

## Pré-requisitos

- Node.js (v16 ou superior)
- npm (geralmente instalado com o Node.js)
- PostgreSQL

---

## Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/MarceloGomesProjetos/LeilaoReverso.git
    cd LeilaoReverso
    ```

2.  **Configure o Backend:**
    - Navegue até a pasta do backend: `cd backend`
    - Crie um arquivo `.env` a partir do exemplo abaixo e preencha com suas credenciais:
      ```env
      PORT=3000
      DB_HOST=localhost
      DB_PORT=5432
      DB_NAME=LeilaoReverso
      DB_USER=postgres
      DB_PASSWORD=sua_senha_aqui
      JWT_SECRET=seu_secret_key_aqui
      ```
    - Instale as dependências: `npm install`

3.  **Configure o Frontend:**
    - Navegue até a pasta do frontend: `cd ../frontend`
    - Instale as dependências: `npm install`

4.  **Banco de Dados:**
    - Certifique-se de que o servidor PostgreSQL esteja em execução.
    - Crie um banco de dados com o nome que você especificou em `DB_NAME` no arquivo `.env` do backend.
    - (WIP) Crie as tabelas necessárias. O esquema do banco de dados ainda será documentado.

---

## Executando a aplicação

### Backend

Com o terminal na pasta `/backend`:
```bash
npm run dev
```
O servidor será iniciado em `http://localhost:3000` (ou na porta definida em seu `.env`).

### Frontend

Com o terminal na pasta `/frontend`:
```bash
npm run dev
```
A aplicação React será iniciada e estará acessível em `http://localhost:5173` (ou em outra porta indicada pelo Vite).

---

## API principal

As rotas principais expostas pelo backend são:
- `POST /api/auth/register` — Para registro de novos usuários.
- `POST /api/auth/login` — Para autenticação de usuários.
- `GET /api/auctions` — Para listar os leilões.
- `POST /api/bids` — Para submeter um novo lance.
- `GET /api/notifications` — Para listar notificações de um usuário.

Para mais detalhes, consulte os arquivos na pasta `backend/routes`.

---

## WebSocket (Tempo real)

O servidor WebSocket escuta na mesma porta do servidor HTTP. O fluxo de mensagens esperado é:

- **Cliente entra em um leilão:**
  ```json
  { "type": "join-auction", "auctionId": "<ID_DO_LEILÃO>" }
  ```
- **Cliente envia um novo lance:**
  ```json
  { "type": "new-bid", "auctionId": "<ID_DO_LEILÃO>", "payload": { /* dados do lance */ } }
  ```
- **Servidor envia atualização para os participantes:**
  ```json
  { "type": "bid-update", "data": { /* dados do novo lance */ } }
  ```

---

## Banco de dados

O projeto utiliza PostgreSQL. As configurações de conexão estão no arquivo `/backend/.env`. O backend tentará testar a conexão com o banco de dados na inicialização.

---

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma *issue* para discutir uma nova feature ou reportar um bug. Pull requests são sempre apreciados.

---

## Licença

Este projeto é de código aberto e está sob a Licença MIT.
