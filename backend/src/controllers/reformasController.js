const { runQuery, getQuery, allQuery } = require('../config/database');

/**
 * Listar todas as reformas
 */
const listarReformas = async (req, res) => {
  try {
    const { search, status, prioridade, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        ra.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone
      FROM reformas_aparelho ra
      INNER JOIN clientes c ON ra.cliente_id = c.id
      WHERE 1=1
    `;
    let params = [];

    // Filtros
    if (search) {
      sql += ' AND (c.nome LIKE ? OR ra.aparelho LIKE ? OR ra.tipo_reforma LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND ra.status = ?';
      params.push(status);
    }

    if (prioridade) {
      sql += ' AND ra.prioridade = ?';
      params.push(prioridade);
    }

    sql += ' ORDER BY ra.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const reformas = await allQuery(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM reformas_aparelho ra INNER JOIN clientes c ON ra.cliente_id = c.id WHERE 1=1';
    let countParams = [];
    
    if (search) {
      countSql += ' AND (c.nome LIKE ? OR ra.aparelho LIKE ? OR ra.tipo_reforma LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      countSql += ' AND ra.status = ?';
      countParams.push(status);
    }
    if (prioridade) {
      countSql += ' AND ra.prioridade = ?';
      countParams.push(prioridade);
    }

    const total = await getQuery(countSql, countParams);

    res.json({
      success: true,
      data: reformas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.total,
        pages: Math.ceil(total.total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar reformas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar reformas'
    });
  }
};

/**
 * Buscar reforma por ID
 */
const buscarReforma = async (req, res) => {
  try {
    const { id } = req.params;

    const reforma = await getQuery(
      `SELECT 
        ra.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        c.email as cliente_email
      FROM reformas_aparelho ra
      INNER JOIN clientes c ON ra.cliente_id = c.id
      WHERE ra.id = ?`,
      [id]
    );

    if (!reforma) {
      return res.status(404).json({
        success: false,
        message: 'Reforma não encontrada'
      });
    }

    res.json({
      success: true,
      data: reforma
    });
  } catch (error) {
    console.error('Erro ao buscar reforma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar reforma'
    });
  }
};

/**
 * Criar nova reforma
 */
const criarReforma = async (req, res) => {
  try {
    const {
      cliente_id,
      aparelho,
      marca,
      modelo,
      tipo_reforma,
      observacoes,
      status,
      prioridade,
      prazo_entrega,
      valor,
      tecnico_responsavel
    } = req.body;

    // Validação básica
    if (!cliente_id || !aparelho || !tipo_reforma || !prazo_entrega) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, aparelho, tipo de reforma e prazo são obrigatórios'
      });
    }

    // Verificar se cliente existe
    const clienteExiste = await getQuery('SELECT id FROM clientes WHERE id = ?', [cliente_id]);
    if (!clienteExiste) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    const result = await runQuery(
      `INSERT INTO reformas_aparelho 
       (cliente_id, aparelho, marca, modelo, tipo_reforma, observacoes, status, prioridade, prazo_entrega, valor, tecnico_responsavel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cliente_id, aparelho, marca, modelo, tipo_reforma, observacoes, status || 'aguardando_pecas', prioridade || 'normal', prazo_entrega, valor || 0, tecnico_responsavel]
    );

    res.status(201).json({
      success: true,
      message: 'Reforma criada com sucesso',
      data: {
        id: result.id
      }
    });
  } catch (error) {
    console.error('Erro ao criar reforma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar reforma'
    });
  }
};

/**
 * Atualizar reforma
 */
const atualizarReforma = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      aparelho,
      marca,
      modelo,
      tipo_reforma,
      observacoes,
      status,
      prioridade,
      prazo_entrega,
      valor,
      valor_pago,
      tecnico_responsavel
    } = req.body;

    // Verificar se reforma existe
    const reformaExiste = await getQuery('SELECT id FROM reformas_aparelho WHERE id = ?', [id]);
    if (!reformaExiste) {
      return res.status(404).json({
        success: false,
        message: 'Reforma não encontrada'
      });
    }

    await runQuery(
      `UPDATE reformas_aparelho 
       SET aparelho = ?, marca = ?, modelo = ?, tipo_reforma = ?, observacoes = ?,
           status = ?, prioridade = ?, prazo_entrega = ?, valor = ?, valor_pago = ?,
           tecnico_responsavel = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [aparelho, marca, modelo, tipo_reforma, observacoes, status, prioridade, prazo_entrega, valor, valor_pago, tecnico_responsavel, id]
    );

    res.json({
      success: true,
      message: 'Reforma atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar reforma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar reforma'
    });
  }
};

/**
 * Deletar reforma
 */
const deletarReforma = async (req, res) => {
  try {
    const { id } = req.params;

    await runQuery('DELETE FROM reformas_aparelho WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Reforma deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar reforma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar reforma'
    });
  }
};

module.exports = {
  listarReformas,
  buscarReforma,
  criarReforma,
  atualizarReforma,
  deletarReforma
};