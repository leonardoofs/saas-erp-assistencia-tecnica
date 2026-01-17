/**
 * Migration: Criar tabela de fabricantes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Iniciando migration 007: create-fabricantes-table...');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS fabricantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL UNIQUE,
      cor VARCHAR(7) NOT NULL DEFAULT '#6366f1',
      ativo BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela fabricantes:', err.message);
      process.exit(1);
    }
    console.log('✅ Tabela fabricantes criada com sucesso!');
  });

  const stmt = db.prepare('INSERT OR IGNORE INTO fabricantes (nome, cor) VALUES (?, ?)');
  stmt.run('Samsung', '#1428a0');
  stmt.run('Apple', '#000000');
  stmt.run('Motorola', '#5c6bc0');
  stmt.run('Xiaomi', '#ff6900');
  stmt.run('LG', '#a50034');
  stmt.run('Nokia', '#124191');
  stmt.run('Asus', '#000000');
  stmt.run('Lenovo', '#e2231a');
  stmt.run('Dell', '#007db8');
  stmt.run('HP', '#0096d6');
  stmt.run('Acer', '#83b81a');
  stmt.run('Positivo', '#009639');
  stmt.finalize(() => {
    console.log('✅ Fabricantes padrão inseridos!');
    db.close();
  });
});
