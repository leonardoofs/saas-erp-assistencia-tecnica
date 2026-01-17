/**
 * Repository para Subgrupos de Produtos
 * Gerencia operações de banco de dados para subgrupos
 */

const { getQuery, allQuery, runQuery } = require('../config/database');

class SubgrupoRepository {
  /**
   * Buscar todos os subgrupos
   */
  static async findAll({ grupo_id, ativo } = {}) {
    let query = `
      SELECT s.*, g.nome as grupo_nome
      FROM subgrupos s
      LEFT JOIN grupos g ON s.grupo_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (grupo_id) {
      query += ' AND s.grupo_id = ?';
      params.push(grupo_id);
    }

    if (ativo !== undefined) {
      query += ' AND s.ativo = ?';
      params.push(ativo ? 1 : 0);
    }

    query += ' ORDER BY g.nome ASC, s.nome ASC';
    return await allQuery(query, params);
  }

  /**
   * Buscar subgrupo por ID
   */
  static async findById(id) {
    const query = `
      SELECT s.*, g.nome as grupo_nome
      FROM subgrupos s
      LEFT JOIN grupos g ON s.grupo_id = g.id
      WHERE s.id = ?
    `;
    return await getQuery(query, [id]);
  }

  /**
   * Buscar subgrupo por nome e grupo
   */
  static async findByNomeAndGrupo(nome, grupo_id) {
    const query = 'SELECT * FROM subgrupos WHERE nome = ? AND grupo_id = ?';
    return await getQuery(query, [nome, grupo_id]);
  }

  /**
   * Criar novo subgrupo
   */
  static async create(dados) {
    const query = `
      INSERT INTO subgrupos (nome, cor, grupo_id, ativo)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      dados.nome,
      dados.cor || '#8b5cf6',
      dados.grupo_id,
      dados.ativo !== undefined ? dados.ativo : 1
    ];

    const result = await runQuery(query, params);
    return await this.findById(result.lastID);
  }

  /**
   * Atualizar subgrupo
   */
  static async update(id, dados) {
    const query = `
      UPDATE subgrupos
      SET nome = ?,
          cor = ?,
          grupo_id = ?,
          ativo = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      dados.nome,
      dados.cor,
      dados.grupo_id,
      dados.ativo,
      id
    ];

    await runQuery(query, params);
    return await this.findById(id);
  }

  /**
   * Deletar subgrupo
   */
  static async delete(id) {
    const query = 'DELETE FROM subgrupos WHERE id = ?';
    return await runQuery(query, [id]);
  }

  /**
   * Verificar se subgrupo tem produtos vinculados
   */
  static async hasProducts(id) {
    const query = 'SELECT COUNT(*) as count FROM produtos WHERE subgrupo_id = ?';
    const result = await getQuery(query, [id]);
    return result.count > 0;
  }
}

module.exports = SubgrupoRepository;
