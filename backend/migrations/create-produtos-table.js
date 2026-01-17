/**
 * UnderTech - Migration: Criar tabela de produtos
 *
 * Estrutura da tabela produtos:
 * - id: Identificador único
 * - codigo: Código SKU do produto (único)
 * - nome: Nome do produto
 * - descricao: Descrição detalhada
 * - categoria: Categoria do produto (telas, baterias, capinhas, acessorios, outros)
 * - marca: Marca do produto
 * - modelo: Modelo compatível
 * - preco_custo: Preço de custo
 * - preco_venda: Preço de venda
 * - margem_lucro: Margem de lucro calculada (%)
 * - fornecedor: Nome do fornecedor
 * - observacoes: Observações adicionais
 * - ativo: Status do produto (1 = ativo, 0 = inativo)
 * - created_at: Data de criação
 * - updated_at: Data de atualização
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Iniciando migration: create-produtos-table...');

db.serialize(() => {
  // Criar tabela produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT NOT NULL DEFAULT 'outros',
      marca TEXT,
      modelo TEXT,
      preco_custo REAL NOT NULL DEFAULT 0,
      preco_venda REAL NOT NULL DEFAULT 0,
      margem_lucro REAL GENERATED ALWAYS AS (
        CASE
          WHEN preco_custo > 0 THEN ((preco_venda - preco_custo) / preco_custo * 100)
          ELSE 0
        END
      ) STORED,
      fornecedor TEXT,
      observacoes TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela produtos:', err.message);
    } else {
      console.log('✅ Tabela produtos criada com sucesso!');
    }
  });

  // Criar índices para melhor performance
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo)
  `);

  console.log('✅ Índices criados com sucesso!');
});

db.close((err) => {
  if (err) {
    console.error('❌ Erro ao fechar banco de dados:', err.message);
  } else {
    console.log('✅ Migration concluída com sucesso!');
  }
});
