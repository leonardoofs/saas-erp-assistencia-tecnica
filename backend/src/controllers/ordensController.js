const { runQuery, getQuery, allQuery } = require('../config/database');

/**
 * Listar todas as ordens de serviço
 */
const listarOrdens = async (req, res) => {
  try {
    const { search, status, prioridade, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        os.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone
      FROM ordens_servico os
      INNER JOIN clientes c ON os.cliente_id = c.id
      WHERE 1=1
    `;
    let params = [];

    // Filtros
    if (search) {
      sql += ' AND (c.nome LIKE ? OR os.aparelho LIKE ? OR os.defeito LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND os.status = ?';
      params.push(status);
    }

    if (prioridade) {
      sql += ' AND os.prioridade = ?';
      params.push(prioridade);
    }

    sql += ' ORDER BY os.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const ordens = await allQuery(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM ordens_servico os INNER JOIN clientes c ON os.cliente_id = c.id WHERE 1=1';
    let countParams = [];
    
    if (search) {
      countSql += ' AND (c.nome LIKE ? OR os.aparelho LIKE ? OR os.defeito LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      countSql += ' AND os.status = ?';
      countParams.push(status);
    }
    if (prioridade) {
      countSql += ' AND os.prioridade = ?';
      countParams.push(prioridade);
    }

    const total = await getQuery(countSql, countParams);

    res.json({
      success: true,
      data: ordens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.total,
        pages: Math.ceil(total.total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar ordens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar ordens de serviço'
    });
  }
};

/**
 * Buscar ordem por ID
 */
const buscarOrdem = async (req, res) => {
  try {
    const { id } = req.params;

    const ordem = await getQuery(
      `SELECT 
        os.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        c.email as cliente_email
      FROM ordens_servico os
      INNER JOIN clientes c ON os.cliente_id = c.id
      WHERE os.id = ?`,
      [id]
    );

    if (!ordem) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    res.json({
      success: true,
      data: ordem
    });
  } catch (error) {
    console.error('Erro ao buscar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ordem de serviço'
    });
  }
};

/**
 * Criar nova ordem de serviço
 */
const criarOrdem = async (req, res) => {
  try {
    const {
      cliente_id,
      aparelho,
      marca,
      modelo,
      imei,
      defeito,
      observacoes,
      status,
      prioridade,
      prazo_entrega,
      valor,
      tecnico_responsavel
    } = req.body;

    // Validação básica
    if (!cliente_id || !aparelho || !defeito || !prazo_entrega) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, aparelho, defeito e prazo são obrigatórios'
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
      `INSERT INTO ordens_servico 
       (cliente_id, aparelho, marca, modelo, imei, defeito, observacoes, status, prioridade, prazo_entrega, valor, tecnico_responsavel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cliente_id, aparelho, marca, modelo, imei, defeito, observacoes, status || 'aguardando_pecas', prioridade || 'normal', prazo_entrega, valor || 0, tecnico_responsavel]
    );

    res.status(201).json({
      success: true,
      message: 'Ordem de serviço criada com sucesso',
      data: {
        id: result.id
      }
    });
  } catch (error) {
    console.error('Erro ao criar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar ordem de serviço'
    });
  }
};

/**
 * Atualizar ordem de serviço
 */
const atualizarOrdem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      aparelho,
      marca,
      modelo,
      imei,
      defeito,
      observacoes,
      status,
      prioridade,
      prazo_entrega,
      valor,
      valor_pago,
      tecnico_responsavel
    } = req.body;

    // Verificar se ordem existe
    const ordemExiste = await getQuery('SELECT id FROM ordens_servico WHERE id = ?', [id]);
    if (!ordemExiste) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    await runQuery(
      `UPDATE ordens_servico 
       SET aparelho = ?, marca = ?, modelo = ?, imei = ?, defeito = ?, observacoes = ?,
           status = ?, prioridade = ?, prazo_entrega = ?, valor = ?, valor_pago = ?,
           tecnico_responsavel = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [aparelho, marca, modelo, imei, defeito, observacoes, status, prioridade, prazo_entrega, valor, valor_pago, tecnico_responsavel, id]
    );

    res.json({
      success: true,
      message: 'Ordem de serviço atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar ordem de serviço'
    });
  }
};

/**
 * Deletar ordem de serviço
 */
const deletarOrdem = async (req, res) => {
  try {
    const { id } = req.params;

    await runQuery('DELETE FROM ordens_servico WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Ordem de serviço deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar ordem de serviço'
    });
  }
};

module.exports = {
  listarOrdens,
  buscarOrdem,
  criarOrdem,
  atualizarOrdem,
  deletarOrdem
};