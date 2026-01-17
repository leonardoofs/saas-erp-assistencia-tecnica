/**
 * Migration: Atualizar estrutura da tabela produtos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Iniciando migration 008: update-produtos-table...');

db.serialize(() => {
  // Verificar se tabela existe
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='produtos'", (err, row) => {
    if (row) {
      // Renomear tabela antiga
      db.run('ALTER TABLE produtos RENAME TO produtos_old', (err) => {
        if (err) console.error('Erro ao renomear:', err);
        else console.log('📦 Tabela antiga renomeada');
      });
    }
  });

  // Criar nova tabela
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo VARCHAR(50) NOT NULL UNIQUE,
      nome VARCHAR(255) NOT NULL,
      descricao TEXT,
      grupo_id INTEGER NOT NULL,
      subgrupo_id INTEGER NOT NULL,
      garantia_id INTEGER NOT NULL,
      fabricante_id INTEGER NULL,
      imei_serie VARCHAR(100) NULL,
      cor VARCHAR(50) NULL,
      armazenamento VARCHAR(50) NULL,
      estoque_atual INTEGER NOT NULL DEFAULT 0,
      estoque_minimo INTEGER NULL,
      estoque_maximo INTEGER NULL,
      preco_custo DECIMAL(10, 2) NULL,
      preco_venda DECIMAL(10, 2) NOT NULL,
      observacoes TEXT,
      ativo BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (grupo_id) REFERENCES grupos(id),
      FOREIGN KEY (subgrupo_id) REFERENCES subgrupos(id),
      FOREIGN KEY (garantia_id) REFERENCES garantias(id),
      FOREIGN KEY (fabricante_id) REFERENCES fabricantes(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar nova tabela produtos:', err.message);
      process.exit(1);
    }
    console.log('✅ Nova tabela produtos criada!');
  });

  // Criar índices
  db.run('CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo)');
  db.run('CREATE INDEX IF NOT EXISTS idx_produtos_grupo ON produtos(grupo_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_produtos_subgrupo ON produtos(subgrupo_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_produtos_garantia ON produtos(garantia_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_produtos_fabricante ON produtos(fabricante_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo)');
  db.run('CREATE INDEX IF NOT EXISTS idx_produtos_imei ON produtos(imei_serie)', () => {
    console.log('✅ Índices criados!');
  });

  // Dropar tabela antiga
  db.run('DROP TABLE IF EXISTS produtos_old', () => {
    console.log('🗑️  Tabela antiga removida');
    db.close();
  });
});
