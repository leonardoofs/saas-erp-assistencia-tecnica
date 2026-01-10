const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/undertech.db');

// Criar pasta database se não existir
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Pasta database criada');
}

// Criar conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite');
  }
});

// Função para executar queries com Promise
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Função para buscar dados com Promise
const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Função para buscar múltiplos registros
const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Inicializar tabelas
const initialize = async () => {
  try {
    // Tabela de usuários
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de clientes
    await runQuery(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE,
        telefone TEXT NOT NULL,
        email TEXT,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de ordens de serviço
    await runQuery(`
      CREATE TABLE IF NOT EXISTS ordens_servico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        aparelho TEXT NOT NULL,
        marca TEXT,
        modelo TEXT,
        imei TEXT,
        defeito TEXT NOT NULL,
        observacoes TEXT,
        status TEXT DEFAULT 'aguardando_pecas',
        prioridade TEXT DEFAULT 'normal',
        prazo_entrega DATE NOT NULL,
        valor REAL DEFAULT 0,
        valor_pago REAL DEFAULT 0,
        tecnico_responsavel TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Tabela de reformas de aparelho
    await runQuery(`
      CREATE TABLE IF NOT EXISTS reformas_aparelho (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        aparelho TEXT NOT NULL,
        marca TEXT,
        modelo TEXT,
        tipo_reforma TEXT NOT NULL,
        observacoes TEXT,
        status TEXT DEFAULT 'aguardando_pecas',
        prioridade TEXT DEFAULT 'normal',
        prazo_entrega DATE NOT NULL,
        valor REAL DEFAULT 0,
        valor_pago REAL DEFAULT 0,
        tecnico_responsavel TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    // Verificar se existe usuário admin
    const adminExists = await getQuery('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (!adminExists) {
      // Criar usuário admin padrão
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await runQuery(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'Administrador', 'admin']
      );
      console.log('Usuário admin criado (username: admin, senha: admin123)');
    }

    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery,
  initialize
};