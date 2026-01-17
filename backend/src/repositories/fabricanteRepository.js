/**
 * Repository para Fabricantes
 * Gerencia operações de banco de dados para fabricantes
 */

const { getQuery, allQuery, runQuery } = require('../config/database');

class FabricanteRepository {
  /**
   * Buscar todos os fabricantes
   */
  static async findAll({ ativo } = {}) {
    let query = 'SELECT * FROM fabricantes WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      query += ' AND ativo = ?';
      params.push(ativo ? 1 : 0);
    }

    query += ' ORDER BY nome ASC';
    return await allQuery(query, params);
  }

  /**
   * Buscar fabricante por ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM fabricantes WHERE id = ?';
    return await getQuery(query, [id]);
  }

  /**
   * Buscar fabricante por nome
   */
  static async findByNome(nome) {
    const query = 'SELECT * FROM fabricantes WHERE nome = ?';
    return await getQuery(query, [nome]);
  }

  /**
   * Criar novo fabricante
   */
  static async create(dados) {
    const query = `
      INSERT INTO fabricantes (nome, cor, ativo)
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
   * Atualizar fabricante
   */
  static async update(id, dados) {
    const query = `
      UPDATE fabricantes
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
   * Deletar fabricante
   */
  static async delete(id) {
    const query = 'DELETE FROM fabricantes WHERE id = ?';
    return await runQuery(query, [id]);
  }

  /**
   * Verificar se fabricante tem produtos vinculados
   */
  static async hasProducts(id) {
    const query = 'SELECT COUNT(*) as count FROM produtos WHERE fabricante_id = ?';
    const result = await getQuery(query, [id]);
    return result.count > 0;
  }
}

module.exports = FabricanteRepository;
