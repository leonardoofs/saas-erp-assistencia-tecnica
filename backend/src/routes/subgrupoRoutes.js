/**
 * Rotas da API de Subgrupos
 */

const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const SubgrupoService = require('../services/subgrupoService');
const { createValidation, updateValidation, idValidation } = require('../middlewares/validators/subgrupoValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * GET /subgrupos
 * Listar todos os subgrupos (com filtro por grupo)
 */
router.get('/', async (req, res) => {
  try {
    const { grupo_id, ativo } = req.query;
    const subgrupos = await SubgrupoService.listar({
      grupo_id: grupo_id ? parseInt(grupo_id) : undefined,
      ativo: ativo !== undefined ? ativo === 'true' || ativo === '1' : undefined
    });

    res.json({
      success: true,
      data: subgrupos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar subgrupos',
      error: error.message
    });
  }
});

/**
 * GET /subgrupos/:id
 * Buscar subgrupo por ID
 */
router.get('/:id', idValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    const subgrupo = await SubgrupoService.buscarPorId(req.params.id);
    res.json({
      success: true,
      data: subgrupo
    });
  } catch (error) {
    const status = error.message === 'Subgrupo não encontrado' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /subgrupos
 * Criar novo subgrupo
 */
router.post('/', createValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    const novoSubgrupo = await SubgrupoService.criar(req.body);
    res.status(201).json({
      success: true,
      message: 'Subgrupo criado com sucesso',
      data: novoSubgrupo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /subgrupos/:id
 * Atualizar subgrupo
 */
router.put('/:id', updateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    const subgrupoAtualizado = await SubgrupoService.atualizar(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Subgrupo atualizado com sucesso',
      data: subgrupoAtualizado
    });
  } catch (error) {
    const status = error.message === 'Subgrupo não encontrado' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /subgrupos/:id
 * Deletar subgrupo
 */
router.delete('/:id', idValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erros de validação',
        errors: errors.array()
      });
    }

    await SubgrupoService.deletar(req.params.id);
    res.json({
      success: true,
      message: 'Subgrupo excluído com sucesso'
    });
  } catch (error) {
    const status = error.message === 'Subgrupo não encontrado' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
