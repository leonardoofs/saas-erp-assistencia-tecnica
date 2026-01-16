/**
 * UnderTech - Setup Script
 * Script para configuração inicial do projeto
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('=================================================');
console.log('UnderTech - Setup Inicial do Projeto');
console.log('=================================================\n');

// 1. Verificar se o arquivo .env existe
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath)) {
  console.log('Criando arquivo .env...');

  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, 'utf8');

    // Gerar JWT Secret seguro
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    envContent = envContent.replace('your_super_secret_jwt_key_here', jwtSecret);

    fs.writeFileSync(envPath, envContent);
    console.log('Arquivo .env criado com sucesso!');
    console.log('JWT_SECRET gerado automaticamente.\n');
  } else {
    console.error('ERRO: Arquivo .env.example não encontrado!');
    process.exit(1);
  }
} else {
  console.log('Arquivo .env já existe. Pulando...\n');
}

// 2. Verificar diretório do banco de dados
const dbDir = path.join(__dirname, '../backend/database');
if (!fs.existsSync(dbDir)) {
  console.log('Criando diretório do banco de dados...');
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Diretório criado com sucesso!\n');
}

// 3. Inicializar banco de dados
console.log('Inicializando banco de dados...');
const db = require('../backend/src/config/database');

db.initialize()
  .then(() => {
    console.log('Banco de dados inicializado com sucesso!\n');

    console.log('=================================================');
    console.log('Setup concluído com sucesso!');
    console.log('=================================================\n');
    console.log('Próximos passos:');
    console.log('1. Revise o arquivo .env com suas configurações');
    console.log('2. Execute "npm run dev" para iniciar o servidor');
    console.log('3. Acesse http://localhost:3000');
    console.log('4. Faça login com as credenciais padrão:');
    console.log('   - Usuário: admin');
    console.log('   - Senha: admin123');
    console.log('5. IMPORTANTE: Altere a senha padrão imediatamente!\n');

    process.exit(0);
  })
  .catch(err => {
    console.error('ERRO ao inicializar banco de dados:', err);
    process.exit(1);
  });
