/**
 * Script para limpar clientes de teste
 * 
 * Salve como: backend/migrations/clean-test-clientes.js
 * Execute: node backend/migrations/clean-test-clientes.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../backend/database/undertech.db');
const db = new sqlite3.Database(dbPath);

console.log('Removendo clientes de teste...\n');

const cpfsTeste = [
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444'
];

let contador = 0;

cpfsTeste.forEach(cpf => {
  db.run('DELETE FROM clientes WHERE cpf = ?', [cpf], function(err) {
    if (err) {
      console.error(`❌ Erro ao remover CPF ${cpf}:`, err.message);
    } else if (this.changes > 0) {
      console.log(`✓ Cliente com CPF ${cpf} removido`);
    } else {
      console.log(`⚠️  Cliente com CPF ${cpf} não encontrado`);
    }

    contador++;
    
    if (contador === cpfsTeste.length) {
      db.close(() => {
        console.log('\n✅ Limpeza concluída!');
      });
    }
  });
});