/**
 * Script para popular banco com clientes de teste
 * 
 * Salve como: backend/migrations/seed-test-clientes.js
 * Execute: node backend/migrations/seed-test-clientes.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../backend/database/undertech.db');
const db = new sqlite3.Database(dbPath);

console.log('Populando banco com clientes de teste...\n');

// Calcular datas baseado na nova lógica
const hoje = new Date();

// ATIVO: até 90 dias (vamos usar 45 dias)
const dias45Atras = new Date(hoje);
dias45Atras.setDate(hoje.getDate() - 45);

// EM RISCO: > 90 e <= 180 dias (vamos usar 120 dias)
const dias120Atras = new Date(hoje);
dias120Atras.setDate(hoje.getDate() - 120);

// INATIVO: > 180 dias (vamos usar 200 dias)
const dias200Atras = new Date(hoje);
dias200Atras.setDate(hoje.getDate() - 200);

// Função para formatar data para SQLite (YYYY-MM-DD)
const formatarData = (data) => {
  return data.toISOString().split('T')[0];
};

const clientesTeste = [
  {
    nome: 'João Silva - ATIVO',
    cpf: '11111111111',
    telefone: '(16) 99999-0001',
    email: 'joao.ativo@email.com',
    endereco: 'Rua A, 100',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    ultima_compra: formatarData(dias45Atras) // 45 dias atrás = ATIVO
  },
  {
    nome: 'Maria Santos - EM RISCO',
    cpf: '22222222222',
    telefone: '(16) 99999-0002',
    email: 'maria.risco@email.com',
    endereco: 'Rua B, 200',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    ultima_compra: formatarData(dias120Atras) // 120 dias atrás = EM RISCO
  },
  {
    nome: 'Pedro Oliveira - INATIVO',
    cpf: '33333333333',
    telefone: '(16) 99999-0003',
    email: 'pedro.inativo@email.com',
    endereco: 'Rua C, 300',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    ultima_compra: formatarData(dias200Atras) // 200 dias atrás = INATIVO
  }
];

// Inserir clientes
let contador = 0;

clientesTeste.forEach((cliente, index) => {
  const sql = `
    INSERT INTO clientes (
      nome, cpf, telefone, email, endereco, cidade, estado, ultima_compra
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    cliente.nome,
    cliente.cpf,
    cliente.telefone,
    cliente.email,
    cliente.endereco,
    cliente.cidade,
    cliente.estado,
    cliente.ultima_compra
  ];

  db.run(sql, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        console.log(`⚠️  Cliente ${cliente.nome} já existe (CPF duplicado)`);
      } else {
        console.error(`❌ Erro ao inserir ${cliente.nome}:`, err.message);
      }
    } else {
      console.log(`✓ ${cliente.nome} inserido (ID: ${this.lastID})`);
    }

    contador++;
    
    if (contador === clientesTeste.length) {
      db.close(() => {
        console.log('\n✅ Processo concluído!');
        console.log('\n📋 RESULTADO ESPERADO:');
        console.log('   • João Silva: 🟢 ATIVO (comprou há 45 dias)');
        console.log('   • Maria Santos: 🟡 EM RISCO (comprou há 120 dias)');
        console.log('   • Pedro Oliveira: 🔴 INATIVO (comprou há 200 dias)');
        console.log('\n📊 LÓGICA:');
        console.log('   • ATIVO: até 90 dias');
        console.log('   • EM RISCO: > 90 e ≤ 180 dias');
        console.log('   • INATIVO: > 180 dias');
        console.log('\n👉 Acesse "Listar Clientes" no sistema para verificar!');
      });
    }
  });
});