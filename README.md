# Leilão Reverso

Leilão Reverso é um sistema de leilões onde o menor lance vence. Este repositório contém uma aplicação full‑stack com backend em Node.js/Express e frontend em Vite (TypeScript). O backend também oferece suporte a WebSocket para atualização de lances em tempo real.

---

## Índice

- [Visão Geral](#visão-geral)
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

Este projeto implementa um sistema de Leilão Reverso com:
- Cadastro/autenticação de usuários
- Criação e listagem de leilões
- Sistema de lances em que o menor lance vence
- Notificações de lances em tempo real via WebSocket

---

## Tecnologias

- Backend: Node.js, Express, ws (WebSocket)
- Banco de dados: PostgreSQL
- Frontend: Vite, TypeScript, Tailwind CSS (configurações já existentes no `frontend`)
- Gerenciamento de pacotes: npm

---

## Estrutura do Repositório

- `/backend` — API e servidor WebSocket
- `/frontend` — Aplicação cliente (Vite + TS)
- (Outros arquivos de configuração: `frontend/package.json`, `backend/package.json`, etc.)

---

## Pré-requisitos

- Node.js (recomenda-se v16+)
- npm
- PostgreSQL

---

## Configuração

1. Clone o repositório:
   ```
   git clone https://github.com/MarceloGomesProjetos/LeilaoReverso.git
   ```

2. Backend — variáveis de ambiente
   - Crie um arquivo `.env` dentro de `/backend` com as variáveis necessárias (exemplo):
     ```
     PORT=3000
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=LeilaoReverso
     DB_USER=postgres
     DB_PASSWORD=sua_senha_aqui
     JWT_SECRET=seu_secret_key_aqui
     ```
   - Observação: não comite o `.env` no repositório.

3. Prepare o banco de dados PostgreSQL:
   - Crie o banco com o nome definido em `DB_NAME` e o usuário configurado.
   - Execute migrations ou crie as tabelas necessárias (veja a seção Banco de dados abaixo).

---

## Executando a aplicação

Backend
1. Instale dependências:
   ```
   cd backend
   npm install
   ```
2. Inicie o servidor:
   - Se existir script `dev`/`start` no `package.json`:
     ```
     npm run dev
     ```
     ou
     ```
     npm start
     ```
   - Alternativamente:
     ```
     node server.js
     ```
3. O servidor roda na porta configurada em `PORT` (padrão: `3000`).

Frontend
1. Instale dependências:
   ```
   cd frontend
   npm install
   ```
2. Inicie a aplicação:
   ```
   npm run dev
   ```
3. Abra o navegador no endereço mostrado pelo Vite (normalmente `http://localhost:5173`).

---

## API principal

As rotas principais expostas pelo backend (conforme `server.js`) são:
- `POST /api/auth` — Autenticação / registro (dependendo das rotas implementadas)
- `GET|POST /api/auctions` — Endpoints de criação/listagem/consulta de leilões
- `POST /api/bids` — Endpoints para submeter lances

(Confira os arquivos em `backend/routes` para detalhes dos endpoints e payloads esperados.)

---

## WebSocket (Tempo real)

O backend inicia um servidor WebSocket para envio de atualizações de lances em tempo real. Fluxo básico (mensagens JSON):

- Cliente envia para participar de um leilão:
  ```json
  { "type": "join-auction", "auctionId": "<ID_DO_LEILÃO>" }
  ```
- Cliente envia um novo lance:
  ```json
  { "type": "new-bid", "auctionId": "<ID_DO_LEILÃO>", "payload": { /* dados do lance */ } }
  ```
- Servidor broadcast para clientes do leilão:
  ```json
  { "type": "bid-update", "data": { /* dados do novo lance */ } }
  ```

Conectar-se via WebSocket para o mesmo host/porta do backend, por exemplo:
- ws://localhost:3000

---

## Banco de dados

- O projeto usa PostgreSQL. Configure as variáveis em `/backend/.env`.
- Se não houver migrations no repositório, crie as tabelas necessárias manualmente ou adicione migrações. Verifique `backend/config` para arquivos de configuração de DB e possíveis scripts.
- O backend executa `db.testConnection()` ao iniciar — garanta que as credenciais estejam corretas.

---

## Contribuição

- Abra uma issue para discutir mudanças importantes.
- Faça um fork, crie uma branch com a feature/fix, e envie um pull request.
- Siga as convenções de código do projeto e escreva mensagens de commit claras.

---

## Licença

Adicione aqui a licença do projeto (por exemplo, MIT) ou qualquer restrição de uso.

---

Se quiser, eu posso:
- Criar o arquivo README.md diretamente no repositório,
- Ajustar o conteúdo (mais detalhes sobre endpoints, esquema do banco ou instruções Docker),
- Gerar um exemplo de arquivo `.env` seguro sem dados reais,
- Ou criar um guia de instalação passo a passo com scripts de migração/seed se você fornecer os esquemas.