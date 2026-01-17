/**
 * UnderTech - Produto Repository
 * Camada de acesso a dados para produtos
 */

const { runQuery, getQuery, allQuery } = require('../config/database');

class ProdutoRepository {
  /**
   * Buscar todos os produtos com filtros e paginação
   * Agora com JOIN para grupos, subgrupos, garantias e fabricantes
   */
  static async findAll({ search, grupo_id, subgrupo_id, ativo, page = 1, limit = 50 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT
        p.*,
        g.nome as grupo_nome,
        g.cor as grupo_cor,
        s.nome as subgrupo_nome,
        s.cor as subgrupo_cor,
        ga.nome as garantia_nome,
        ga.cor as garantia_cor,
        ga.meses as garantia_meses,
        f.nome as fabricante_nome,
        f.cor as fabricante_cor
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos s ON p.subgrupo_id = s.id
      LEFT JOIN garantias ga ON p.garantia_id = ga.id
      LEFT JOIN fabricantes f ON p.fabricante_id = f.id
      WHERE 1=1
    `;
    const params = [];

    // Filtro de busca
    if (search) {
      query += ' AND (p.nome LIKE ? OR p.codigo LIKE ? OR p.imei_serie LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Filtro de grupo
    if (grupo_id) {
      query += ' AND p.grupo_id = ?';
      params.push(grupo_id);
    }

    // Filtro de subgrupo
    if (subgrupo_id) {
      query += ' AND p.subgrupo_id = ?';
      params.push(subgrupo_id);
    }

    // Filtro de status ativo
    if (ativo !== undefined) {
      query += ' AND p.ativo = ?';
      params.push(ativo ? 1 : 0);
    }

    // Ordenação e paginação
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Executar query
    const data = await allQuery(query, params);

    // Contar total de registros
    let countQuery = 'SELECT COUNT(*) as total FROM produtos p WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (p.nome LIKE ? OR p.codigo LIKE ? OR p.imei_serie LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (grupo_id) {
      countQuery += ' AND p.grupo_id = ?';
      countParams.push(grupo_id);
    }

    if (subgrupo_id) {
      countQuery += ' AND p.subgrupo_id = ?';
      countParams.push(subgrupo_id);
    }

    if (ativo !== undefined) {
      countQuery += ' AND p.ativo = ?';
      countParams.push(ativo ? 1 : 0);
    }

    const countResult = await getQuery(countQuery, countParams);
    const total = countResult.total;
    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    };
  }

  /**
   * Buscar produto por ID com dados relacionados
   */
  static async findById(id) {
    const query = `
      SELECT
        p.*,
        g.nome as grupo_nome,
        g.cor as grupo_cor,
        s.nome as subgrupo_nome,
        s.cor as subgrupo_cor,
        ga.nome as garantia_nome,
        ga.cor as garantia_cor,
        ga.meses as garantia_meses,
        f.nome as fabricante_nome,
        f.cor as fabricante_cor
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos s ON p.subgrupo_id = s.id
      LEFT JOIN garantias ga ON p.garantia_id = ga.id
      LEFT JOIN fabricantes f ON p.fabricante_id = f.id
      WHERE p.id = ?
    `;
    return await getQuery(query, [id]);
  }

  /**
   * Buscar produto por código
   */
  static async findByCodigo(codigo) {
    const query = 'SELECT * FROM produtos WHERE codigo = ?';
    return await getQuery(query, [codigo]);
  }

  /**
   * Buscar produto por IMEI/Série
   */
  static async findByImei(imei_serie) {
    const query = 'SELECT * FROM produtos WHERE imei_serie = ?';
    return await getQuery(query, [imei_serie]);
  }

  /**
   * Gerar próximo código sequencial para o dia
   */
  static async generateNextCode() {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();

    const prefix = `PROD${dia}${mes}${ano}`;

    // Buscar último código do dia
    const query = `
      SELECT codigo FROM produtos
      WHERE codigo LIKE ?
      ORDER BY codigo DESC
      LIMIT 1
    `;
    const ultimoCodigo = await getQuery(query, [`${prefix}%`]);

    if (!ultimoCodigo) {
      return `${prefix}001`;
    }

    // Extrair número sequencial e incrementar
    const ultimoNumero = parseInt(ultimoCodigo.codigo.slice(-3));
    const proximoNumero = String(ultimoNumero + 1).padStart(3, '0');

    return `${prefix}${proximoNumero}`;
  }

  /**
   * Criar novo produto
   */
  static async create(produtoData) {
    const query = `
      INSERT INTO produtos (
        codigo, nome, descricao,
        grupo_id, subgrupo_id, garantia_id, fabricante_id,
        imei_serie, cor, armazenamento,
        estoque_atual, estoque_minimo, estoque_maximo,
        preco_custo, preco_venda,
        observacoes, ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      produtoData.codigo,
      produtoData.nome,
      produtoData.descricao || null,
      produtoData.grupo_id,
      produtoData.subgrupo_id,
      produtoData.garantia_id,
      produtoData.fabricante_id || null,
      produtoData.imei_serie || null,
      produtoData.cor || null,
      produtoData.armazenamento || null,
      produtoData.estoque_atual,
      produtoData.estoque_minimo || null,
      produtoData.estoque_maximo || null,
      produtoData.preco_custo || null,
      produtoData.preco_venda,
      produtoData.observacoes || null,
      produtoData.ativo !== undefined ? produtoData.ativo : 1
    ];

    const result = await runQuery(query, params);
    return await this.findById(result.lastID);
  }

  /**
   * Atualizar produto
   */
  static async update(id, produtoData) {
    const query = `
      UPDATE produtos SET
        codigo = ?,
        nome = ?,
        descricao = ?,
        grupo_id = ?,
        subgrupo_id = ?,
        garantia_id = ?,
        fabricante_id = ?,
        imei_serie = ?,
        cor = ?,
        armazenamento = ?,
        estoque_atual = ?,
        estoque_minimo = ?,
        estoque_maximo = ?,
        preco_custo = ?,
        preco_venda = ?,
        observacoes = ?,
        ativo = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      produtoData.codigo,
      produtoData.nome,
      produtoData.descricao || null,
      produtoData.grupo_id,
      produtoData.subgrupo_id,
      produtoData.garantia_id,
      produtoData.fabricante_id || null,
      produtoData.imei_serie || null,
      produtoData.cor || null,
      produtoData.armazenamento || null,
      produtoData.estoque_atual,
      produtoData.estoque_minimo || null,
      produtoData.estoque_maximo || null,
      produtoData.preco_custo || null,
      produtoData.preco_venda,
      produtoData.observacoes || null,
      produtoData.ativo !== undefined ? produtoData.ativo : 1,
      id
    ];

    await runQuery(query, params);
    return await this.findById(id);
  }

  /**
   * Deletar produto
   */
  static async delete(id) {
    const query = 'DELETE FROM produtos WHERE id = ?';
    return await runQuery(query, [id]);
  }

  /**
   * Buscar produtos recentes
   */
  static async findRecent(limit = 5) {
    const query = `
      SELECT
        p.*,
        g.nome as grupo_nome,
        s.nome as subgrupo_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos s ON p.subgrupo_id = s.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    return await allQuery(query, [limit]);
  }

  /**
   * Contar produtos por grupo
   */
  static async countByGrupo() {
    const query = `
      SELECT g.nome as grupo, g.cor, COUNT(*) as total
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      WHERE p.ativo = 1
      GROUP BY g.nome, g.cor
    `;
    return await allQuery(query);
  }

  /**
   * Buscar produtos com estoque baixo
   */
  static async findLowStock() {
    const query = `
      SELECT
        p.*,
        g.nome as grupo_nome,
        s.nome as subgrupo_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos s ON p.subgrupo_id = s.id
      WHERE p.ativo = 1
        AND p.estoque_minimo IS NOT NULL
        AND p.estoque_atual <= p.estoque_minimo
      ORDER BY p.estoque_atual ASC
    `;
    return await allQuery(query);
  }
}

module.exports = ProdutoRepository;
