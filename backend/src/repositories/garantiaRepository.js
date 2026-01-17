/**
 * Repository para Garantias
 * Gerencia operações de banco de dados para garantias
 */

const { getQuery, allQuery, runQuery } = require('../config/database');

class GarantiaRepository {
  /**
   * Buscar todas as garantias
   */
  static async findAll({ ativo } = {}) {
    let query = 'SELECT * FROM garantias WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo ? 1 : 0);
    }

    query += ' ORDER BY meses ASC';
    return await allQuery(query, params);
  }

  /**
   * Buscar garantia por ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM garantias WHERE id = ?';
    return await getQuery(query, [id]);
  }

  /**
   * Buscar garantia por nome
   */
  static async findByNome(nome) {
    const query = 'SELECT * FROM garantias WHERE nome = ?';
    return await getQuery(query, [nome]);
  }

  /**
   * Criar nova garantia
   */
  static async create(dados) {
    const query = `
      INSERT INTO garantias (nome, meses, cor, ativo)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      dados.nome,
      dados.meses,
      dados.cor || '#6366f1',
      dados.ativo !== undefined ? dados.ativo : 1
    ];

    const result = await runQuery(query, params);
    return await this.findById(result.lastID);
  }

  /**
   * Atualizar garantia
   */
  static async update(id, dados) {
    const query = `
      UPDATE garantias
      SET nome = ?,
          meses = ?,
          cor = ?,
          ativo = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      dados.nome,
      dados.meses,
      dados.cor,
      dados.ativo,
      id
    ];

    await runQuery(query, params);
    return await this.findById(id);
  }

  /**
   * Deletar garantia
   */
  static async delete(id) {
    const query = 'DELETE FROM garantias WHERE id = ?';
    return await runQuery(query, [id]);
  }

  /**
   * Verificar se garantia tem produtos vinculados
   */
  static async hasProducts(id) {
    const query = 'SELECT COUNT(*) as count FROM produtos WHERE garantia_id = ?';
    const result = await getQuery(query, [id]);
    return result.count > 0;
  }
}

module.exports = GarantiaRepository;
