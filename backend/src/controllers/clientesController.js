const { runQuery, getQuery, allQuery } = require('../config/database');

/**
 * Listar todos os clientes
 */
const listarClientes = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM clientes';
    let params = [];

    // Filtro de busca
    if (search) {
      sql += ' WHERE nome LIKE ? OR cpf LIKE ? OR telefone LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const clientes = await allQuery(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM clientes';
    if (search) {
      countSql += ' WHERE nome LIKE ? OR cpf LIKE ? OR telefone LIKE ?';
    }
    const total = await getQuery(countSql, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []);

    res.json({
      success: true,
      data: clientes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.total,
        pages: Math.ceil(total.total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar clientes'
    });
  }
};

/**
 * Buscar cliente por ID
 */
const buscarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await getQuery('SELECT * FROM clientes WHERE id = ?', [id]);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente'
    });
  }
};

/**
 * Criar novo cliente
 */
const criarCliente = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      telefone,
      email,
      endereco,
      cidade,
      estado,
      cep,
      observacoes
    } = req.body;

    // Validação básica
    if (!nome || !telefone) {
      return res.status(400).json({
        success: false,
        message: 'Nome e telefone são obrigatórios'
      });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const clienteExistente = await getQuery('SELECT id FROM clientes WHERE cpf = ?', [cpf]);
      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          message: 'CPF já cadastrado'
        });
      }
    }

    const result = await runQuery(
      `INSERT INTO clientes (nome, cpf, telefone, email, endereco, cidade, estado, cep, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cpf, telefone, email, endereco, cidade, estado, cep, observacoes]
    );

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso',
      data: {
        id: result.id,
        nome,
        cpf,
        telefone
      }
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar cliente'
    });
  }
};

/**
 * Atualizar cliente
 */
const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      cpf,
      telefone,
      email,
      endereco,
      cidade,
      estado,
      cep,
      observacoes
    } = req.body;

    // Verificar se cliente existe
    const clienteExistente = await getQuery('SELECT id FROM clientes WHERE id = ?', [id]);
    if (!clienteExistente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    await runQuery(
      `UPDATE clientes 
       SET nome = ?, cpf = ?, telefone = ?, email = ?, endereco = ?, 
           cidade = ?, estado = ?, cep = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nome, cpf, telefone, email, endereco, cidade, estado, cep, observacoes, id]
    );

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente'
    });
  }
};

/**
 * Deletar cliente
 */
const deletarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se cliente tem ordens/reformas associadas
    const ordensCount = await getQuery(
      'SELECT COUNT(*) as count FROM ordens_servico WHERE cliente_id = ?',
      [id]
    );
    
    const reformasCount = await getQuery(
      'SELECT COUNT(*) as count FROM reformas_aparelho WHERE cliente_id = ?',
      [id]
    );

    if (ordensCount.count > 0 || reformasCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar cliente com ordens/reformas associadas'
      });
    }

    await runQuery('DELETE FROM clientes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar cliente'
    });
  }
};

module.exports = {
  listarClientes,
  buscarCliente,
  criarCliente,
  atualizarCliente,
  deletarCliente
};