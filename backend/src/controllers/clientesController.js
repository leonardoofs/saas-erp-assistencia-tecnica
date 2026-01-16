/**
 * UnderTech - Clientes Controller
 * Camada de controle para endpoints de clientes
 */

const ClienteService = require('../services/clienteService');

/**
 * Lista todos os clientes
 * GET /api/clientes
 */
const listarClientes = async (req, res) => {
  try {
    const resultado = await ClienteService.listar(req.query);

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
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
 * Busca cliente por ID
 * GET /api/clientes/:id
 */
const buscarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await ClienteService.buscarPorId(id);

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    
    if (error.message === 'Cliente não encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente'
    });
  }
};

/**
 * Cria novo cliente
 * POST /api/clientes
 */
const criarCliente = async (req, res) => {
  try {
    const resultado = await ClienteService.criar(req.body);

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso',
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);

    if (
      error.message.includes('obrigatório') ||
      error.message.includes('inválido') ||
      error.message.includes('já cadastrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar cliente'
    });
  }
};

/**
 * Atualiza cliente existente
 * PUT /api/clientes/:id
 */
const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    await ClienteService.atualizar(id, req.body);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);

    if (error.message === 'Cliente não encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (
      error.message.includes('inválido') ||
      error.message.includes('já cadastrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente'
    });
  }
};

/**
 * Remove cliente
 * DELETE /api/clientes/:id
 */
const deletarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    await ClienteService.deletar(id);

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);

    if (error.message.includes('associadas')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

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