/**
 * UnderTech - Cliente Repository
 * Camada de acesso a dados para clientes
 */

const { runQuery, getQuery, allQuery } = require('../config/database');

class ClienteRepository {
  /**
   * Busca todos os clientes com filtros
   * 
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} Clientes e paginação
   */
  static async findAll(options = {}) {
    const { search, page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM clientes';
    let params = [];

    // Aplicar filtro de busca
    if (search) {
      sql += ' WHERE nome LIKE ? OR cpf LIKE ? OR telefone LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const data = await allQuery(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM clientes';
    const countParams = search 
      ? [`%${search}%`, `%${search}%`, `%${search}%`]
      : [];

    if (search) {
      countSql += ' WHERE nome LIKE ? OR cpf LIKE ? OR telefone LIKE ?';
    }

    const { total } = await getQuery(countSql, countParams);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Busca cliente por ID
   * 
   * @param {number} id - ID do cliente
   * @returns {Promise<Object|null>} Cliente ou null
   */
  static async findById(id) {
    return await getQuery('SELECT * FROM clientes WHERE id = ?', [id]);
  }

  /**
   * Busca cliente por CPF
   * 
   * @param {string} cpf - CPF do cliente
   * @returns {Promise<Object|null>} Cliente ou null
   */
  static async findByCPF(cpf) {
    return await getQuery(
      'SELECT id, nome FROM clientes WHERE cpf = ?',
      [cpf]
    );
  }

  /**
   * Cria novo cliente
   * 
   * @param {Object} dadosCliente - Dados do cliente
   * @returns {Promise<Object>} Cliente criado
   */
  static async create(dadosCliente) {
    const {
      nome, cpf, telefone, telefone_contato, email,
      situacao, responsavel, endereco, cidade, estado,
      cep, observacoes
    } = dadosCliente;

    const result = await runQuery(
      `INSERT INTO clientes (
        nome, cpf, telefone, telefone_contato, email,
        situacao, responsavel, endereco, cidade, estado,
        cep, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, cpf, telefone, telefone_contato, email,
        situacao, responsavel, endereco, cidade, estado,
        cep, observacoes
      ]
    );

    return {
      id: result.id,
      nome,
      cpf,
      telefone
    };
  }

  /**
   * Atualiza cliente existente
   * 
   * @param {number} id - ID do cliente
   * @param {Object} dadosCliente - Dados para atualizar
   * @returns {Promise<void>}
   */
  static async update(id, dadosCliente) {
    const {
      nome, cpf, telefone, telefone_contato, email,
      situacao, responsavel, endereco, cidade, estado,
      cep, observacoes, ultima_compra
    } = dadosCliente;

    await runQuery(
      `UPDATE clientes 
       SET nome = ?, cpf = ?, telefone = ?, telefone_contato = ?,
           email = ?, situacao = ?, responsavel = ?, endereco = ?,
           cidade = ?, estado = ?, cep = ?, observacoes = ?,
           ultima_compra = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nome, cpf, telefone, telefone_contato, email,
        situacao, responsavel, endereco, cidade, estado,
        cep, observacoes, ultima_compra, id
      ]
    );
  }

  /**
   * Remove cliente
   * 
   * @param {number} id - ID do cliente
   * @returns {Promise<void>}
   */
  static async delete(id) {
    await runQuery('DELETE FROM clientes WHERE id = ?', [id]);
  }

  /**
   * Verifica se cliente tem ordens de serviço
   * 
   * @param {number} id - ID do cliente
   * @returns {Promise<boolean>}
   */
  static async hasOrdens(id) {
    const result = await getQuery(
      'SELECT COUNT(*) as count FROM ordens_servico WHERE cliente_id = ?',
      [id]
    );
    return result.count > 0;
  }

  /**
   * Verifica se cliente tem reformas
   * 
   * @param {number} id - ID do cliente
   * @returns {Promise<boolean>}
   */
  static async hasReformas(id) {
    const result = await getQuery(
      'SELECT COUNT(*) as count FROM reformas_aparelho WHERE cliente_id = ?',
      [id]
    );
    return result.count > 0;
  }
}

module.exports = ClienteRepository;