/**
 * Migration: Criar tabela de grupos de produtos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Iniciando migration 004: create-grupos-table...');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL UNIQUE,
      cor VARCHAR(7) NOT NULL DEFAULT '#6366f1',
      ativo BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela grupos:', err.message);
      process.exit(1);
    }
    console.log('✅ Tabela grupos criada com sucesso!');
  });

  const stmt = db.prepare('INSERT OR IGNORE INTO grupos (nome, cor) VALUES (?, ?)');
  stmt.run('Acessório', '#10b981');
  stmt.run('Aparelho', '#3b82f6');
  stmt.finalize(() => {
    console.log('✅ Grupos padrão inseridos!');
    db.close();
  });
});
