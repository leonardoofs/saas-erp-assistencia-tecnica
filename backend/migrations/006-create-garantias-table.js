/**
 * Migration: Criar tabela de garantias
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Iniciando migration 006: create-garantias-table...');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS garantias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(50) NOT NULL UNIQUE,
      meses INTEGER NOT NULL,
      cor VARCHAR(7) NOT NULL DEFAULT '#6366f1',
      ativo BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela garantias:', err.message);
      process.exit(1);
    }
    console.log('✅ Tabela garantias criada com sucesso!');
  });

  const stmt = db.prepare('INSERT OR IGNORE INTO garantias (nome, meses, cor) VALUES (?, ?, ?)');
  stmt.run('Sem garantia', 0, '#ef4444');
  stmt.run('3 meses', 3, '#f59e0b');
  stmt.run('6 meses', 6, '#10b981');
  stmt.run('1 ano', 12, '#3b82f6');
  stmt.finalize(() => {
    console.log('✅ Garantias padrão inseridas!');
    db.close();
  });
});
