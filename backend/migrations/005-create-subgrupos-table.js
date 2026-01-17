/**
 * Migration: Criar tabela de subgrupos de produtos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Iniciando migration 005: create-subgrupos-table...');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS subgrupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL,
      cor VARCHAR(7) NOT NULL DEFAULT '#8b5cf6',
      grupo_id INTEGER NOT NULL,
      ativo BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
      UNIQUE(nome, grupo_id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela subgrupos:', err.message);
      process.exit(1);
    }
    console.log('✅ Tabela subgrupos criada com sucesso!');
  });

  db.get('SELECT id FROM grupos WHERE nome = ?', ['Acessório'], (err, grupoAcessorio) => {
    db.get('SELECT id FROM grupos WHERE nome = ?', ['Aparelho'], (err, grupoAparelho) => {
      const stmt = db.prepare('INSERT OR IGNORE INTO subgrupos (nome, cor, grupo_id) VALUES (?, ?, ?)');

      // Subgrupos de Acessório
      stmt.run('Capinha', '#10b981', grupoAcessorio.id);
      stmt.run('Película 3D', '#14b8a6', grupoAcessorio.id);
      stmt.run('Carregador (Fonte + Cabo)', '#06b6d4', grupoAcessorio.id);
      stmt.run('Fonte carregador', '#0ea5e9', grupoAcessorio.id);
      stmt.run('Cabo', '#3b82f6', grupoAcessorio.id);
      stmt.run('Fone de ouvido auricular', '#6366f1', grupoAcessorio.id);
      stmt.run('Headset', '#8b5cf6', grupoAcessorio.id);
      stmt.run('Mouse', '#a855f7', grupoAcessorio.id);
      stmt.run('Teclado', '#d946ef', grupoAcessorio.id);
      stmt.run('Kit', '#ec4899', grupoAcessorio.id);

      // Subgrupos de Aparelho
      stmt.run('Celular novo', '#3b82f6', grupoAparelho.id);
      stmt.run('Celular seminovo', '#6366f1', grupoAparelho.id);
      stmt.run('Notebook', '#8b5cf6', grupoAparelho.id);
      stmt.run('PC Gamer', '#a855f7', grupoAparelho.id);
      stmt.run('PC de escritório', '#d946ef', grupoAparelho.id);

      stmt.finalize(() => {
        console.log('✅ Subgrupos padrão inseridos!');
        db.close();
      });
    });
  });
});
