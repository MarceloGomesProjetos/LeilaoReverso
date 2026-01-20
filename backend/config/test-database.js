const path = require('path');

// Carregar o .env da raiz do projeto (2 níveis acima: backend/config -> backend -> raiz)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { Client } = require('pg');

// Exibir as configurações carregadas (sem mostrar a senha completa)
console.log('=== Configurações do Banco de Dados ===');
console.log('Caminho .env:', path.join(__dirname, '../../.env'));
console.log('Host:', process.env.DB_HOST || 'NÃO DEFINIDO');
console.log('Port:', process.env.DB_PORT || 'NÃO DEFINIDO');
console.log('Database:', process.env.DB_NAME || 'NÃO DEFINIDO');
console.log('User:', process.env.DB_USER || 'NÃO DEFINIDO');
console.log('Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NÃO DEFINIDO');
console.log('=====================================\n');

// Função de teste de conexão
async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Tentando conectar ao PostgreSQL...\n');
    
    await client.connect();
    console.log('✓ Conexão estabelecida com sucesso!\n');

    // Testar uma query simples
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✓ Query executada com sucesso!');
    console.log('Horário do servidor:', result.rows[0].current_time);
    console.log('Versão do PostgreSQL:', result.rows[0].version);
    
    await client.end();
    console.log('\n✓ Conexão encerrada corretamente');
    
  } catch (error) {
    console.error('✗ Erro ao conectar com o banco de dados:\n');
    console.error('Código do erro:', error.code);
    console.error('Mensagem:', error.message);
    
    // Sugestões baseadas no tipo de erro
    if (error.code === '28P01') {
      console.error('\n⚠ SOLUÇÃO: Senha incorreta ou usuário não autorizado');
      console.error('   - Verifique se a senha no .env está correta');
      console.error('   - Execute: ALTER USER postgres WITH PASSWORD \'nova-senha\';');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠ SOLUÇÃO: PostgreSQL não está rodando ou host/porta incorretos');
      console.error('   - Verifique se o PostgreSQL está iniciado');
      console.error('   - Confirme o host e porta no .env');
    } else if (error.code === '3D000') {
      console.error('\n⚠ SOLUÇÃO: Database não existe');
      console.error('   - Crie o database ou verifique o nome no .env');
    }
    
    process.exit(1);
  }
}

// Executar o teste
testConnection();
