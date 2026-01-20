const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client } = require('pg');

// 1. Configuração
const genAI = new GoogleGenerativeAI("SUA_API_KEY_DO_GEMINI");
const model = genAI.getGenerativeModel({ model: "text-embedding-004"});

const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'seu_banco_de_leilao',
    password: 'sua_senha',
    port: 5432,
};

async function ingest() {
    const client = new Client(dbConfig);
    await client.connect();

    // 2. Ler o Markdown que você já tem na raiz do projeto
    const markdown = fs.readFileSync('../Makedown_LeilaoReverso.md', 'utf8');
    
    // 3. Quebrar o texto em partes (Ex: por tópicos de Markdown)
    const chunks = markdown.split('##').filter(c => c.trim().length > 0);

    console.log(`Processando ${chunks.length} seções de conhecimento...`);

    for (const chunk of chunks) {
        // 4. Gerar o Embedding usando a API do Gemini
        const result = await model.embedContent(chunk);
        const embedding = result.embedding.values;

        // 5. Salvar no PostgreSQL (com a extensão vector que você está instalando)
        await client.query(
            'INSERT INTO knowledge_base (content, embedding) VALUES ($1, $2)',
            [chunk, `[${embedding.join(',')}]`]
        );
    }

    console.log("Base de conhecimento integrada com sucesso!");
    await client.end();
}

ingest().catch(console.error);