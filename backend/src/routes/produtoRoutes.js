/**
 * UnderTech - Produto Routes
 * Rotas da API de produtos
 */

const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const ProdutoService = require('../services/produtoService');
const { createValidation, updateValidation, idValidation } = require('../middlewares/validators/produtoValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * GET /produtos/gerar-codigo
 * Gerar próximo código automático
 */
router.get('/gerar-codigo', async (req, res) => {
  try {
    const codigo = await ProdutoService.gerarCodigo();
    res.json({
      success: true,
      data: { codigo }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar código',
      error: error.message
    });
  }
});

/**
 * GET /produtos
 * Listar produtos com filtros e paginação
 */
router.get('/', async (req, res) => {
  try {
    const { search, grupo_id, subgrupo_id, ativo, page, limit } = req.query;

    const resultado = await ProdutoService.listar({
      search,
      grupo_id,
      subgrupo_id,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
      page,
      limit
    });

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos',
      error: error.message
    });
  }
});

/**
 * GET /produtos/recentes
 * Buscar produtos recentes
 */
router.get('/recentes', async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const produtos = await ProdutoService.buscarRecentes(parseInt(limit));

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos recentes',
      error: error.message
    });
  }
});

/**
 * GET /produtos/:id
 * Buscar produto por ID
 */
router.get('/:id', idValidation, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    const produto = await ProdutoService.buscarPorId(req.params.id);

    res.json({
      success: true,
      data: produto
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);

    if (error.message === 'Produto não encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto',
      error: error.message
    });
  }
});

/**
 * POST /produtos
 * Criar novo produto
 */
router.post('/', createValidation, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    const produto = await ProdutoService.criar(req.body);

    res.status(201).json({
      success: true,
      message: 'Produto cadastrado com sucesso',
      data: produto
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);

    if (error.message === 'Código já está em uso') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar produto',
      error: error.message
    });
  }
});

/**
 * PUT /produtos/:id
 * Atualizar produto
 */
router.put('/:id', updateValidation, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    const produto = await ProdutoService.atualizar(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: produto
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);

    if (error.message === 'Produto não encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Código já está em uso por outro produto') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
});

/**
 * DELETE /produtos/:id
 * Deletar produto
 */
router.delete('/:id', idValidation, async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    await ProdutoService.deletar(req.params.id);

    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);

    if (error.message === 'Produto não encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao deletar produto',
      error: error.message
    });
  }
});

module.exports = router;
