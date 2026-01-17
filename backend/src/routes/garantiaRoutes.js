/**
 * Rotas da API de Garantias
 */

const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const GarantiaService = require('../services/garantiaService');
const { createValidation, updateValidation, idValidation } = require('../middlewares/validators/garantiaValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * GET /garantias
 * Listar todas as garantias
 */
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    const garantias = await GarantiaService.listar({
      ativo: ativo !== undefined ? ativo === 'true' || ativo === '1' : undefined
    });

    res.json({
      success: true,
      data: garantias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar garantias',
      error: error.message
    });
  }
});

/**
 * GET /garantias/:id
 * Buscar garantia por ID
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

    const garantia = await GarantiaService.buscarPorId(req.params.id);
    res.json({
      success: true,
      data: garantia
    });
  } catch (error) {
    const status = error.message === 'Garantia não encontrada' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /garantias
 * Criar nova garantia
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

    const novaGarantia = await GarantiaService.criar(req.body);
    res.status(201).json({
      success: true,
      message: 'Garantia criada com sucesso',
      data: novaGarantia
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /garantias/:id
 * Atualizar garantia
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

    const garantiaAtualizada = await GarantiaService.atualizar(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Garantia atualizada com sucesso',
      data: garantiaAtualizada
    });
  } catch (error) {
    const status = error.message === 'Garantia não encontrada' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /garantias/:id
 * Deletar garantia
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

    await GarantiaService.deletar(req.params.id);
    res.json({
      success: true,
      message: 'Garantia excluída com sucesso'
    });
  } catch (error) {
    const status = error.message === 'Garantia não encontrada' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
