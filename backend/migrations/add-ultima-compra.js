/**
 * UnderTech - Migration para Sistema de Situação Automática
 * 
 * Execute este script UMA VEZ para atualizar o banco de dados
 * 
 * COMO EXECUTAR:
 * node backend/migrations/add-ultima-compra.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho absoluto para o banco
const dbPath = path.resolve(__dirname, '../../backend/database/undertech.db');

console.log('Procurando banco em:', dbPath);

// Verificar se o arquivo existe
if (!fs.existsSync(dbPath)) {
  console.error('\nERRO: Banco de dados não encontrado!');
  console.error('Caminho esperado:', dbPath);
  console.error('\nO arquivo do banco existe? Verifique a pasta database/');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com banco de dados:', err);
    process.exit(1);
  }
  console.log('✓ Conectado ao banco de dados SQLite\n');
  console.log('Iniciando migração...\n');
});

// Adicionar coluna ultima_compra à tabela clientes
db.run(`
  ALTER TABLE clientes 
  ADD COLUMN telefone_contato TEXT DEFAULT NULL
`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✓ Coluna "ultima_compra" já existe. Nenhuma ação necessária.');
    } else {
      console.error('Erro ao adicionar coluna:', err.message);
    }
  } else {
    console.log('✓ Coluna "ultima_compra" adicionada com sucesso!');
  }
  
  // Fechar conexão
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco:', err);
    } else {
      console.log('\nMigração concluída com sucesso!');
    }
  });
});