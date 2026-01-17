/**
 * Repository para Grupos de Produtos
 * Gerencia operações de banco de dados para grupos
 */

const { getQuery, allQuery, runQuery } = require('../config/database');

class GrupoRepository {
  /**
   * Buscar todos os grupos
   */
  static async findAll({ ativo } = {}) {
    let query = 'SELECT * FROM grupos WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo ? 1 : 0);
    }

    query += ' ORDER BY nome ASC';
    return await allQuery(query, params);
  }

  /**
   * Buscar grupo por ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM grupos WHERE id = ?';
    return await getQuery(query, [id]);
  }

  /**
   * Buscar grupo por nome
   */
  static async findByNome(nome) {
    const query = 'SELECT * FROM grupos WHERE nome = ?';
    return await getQuery(query, [nome]);
  }

  /**
   * Criar novo grupo
   */
  static async create(dados) {
    const query = `
      INSERT INTO grupos (nome, cor, ativo)
      VALUES (?, ?, ?)
    `;
    const params = [
      dados.nome,
      dados.cor || '#6366f1',
      dados.ativo !== undefined ? dados.ativo : 1
    ];

    const result = await runQuery(query, params);
    return await this.findById(result.lastID);
  }

  /**
   * Atualizar grupo
   */
  static async update(id, dados) {
    const query = `
      UPDATE grupos
      SET nome = ?,
          cor = ?,
          ativo = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      dados.nome,
      dados.cor,
      dados.ativo,
      id
    ];

    await runQuery(query, params);
    return await this.findById(id);
  }

  /**
   * Deletar grupo
   */
  static async delete(id) {
    const query = 'DELETE FROM grupos WHERE id = ?';
    return await runQuery(query, [id]);
  }

  /**
   * Verificar se grupo tem produtos vinculados
   */
  static async hasProducts(id) {
    const query = 'SELECT COUNT(*) as count FROM produtos WHERE grupo_id = ?';
    const result = await getQuery(query, [id]);
    return result.count > 0;
  }
}

module.exports = GrupoRepository;
