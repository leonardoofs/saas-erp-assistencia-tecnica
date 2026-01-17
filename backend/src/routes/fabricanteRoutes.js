/**
 * Rotas da API de Fabricantes
 */

const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const FabricanteService = require('../services/fabricanteService');
const { createValidation, updateValidation, idValidation } = require('../middlewares/validators/fabricanteValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * GET /fabricantes
 * Listar todos os fabricantes
 */
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    const fabricantes = await FabricanteService.listar({
      ativo: ativo !== undefined ? ativo === 'true' || ativo === '1' : undefined
    });

    res.json({
      success: true,
      data: fabricantes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar fabricantes',
      error: error.message
    });
  }
});

/**
 * GET /fabricantes/:id
 * Buscar fabricante por ID
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

    const fabricante = await FabricanteService.buscarPorId(req.params.id);
    res.json({
      success: true,
      data: fabricante
    });
  } catch (error) {
    const status = error.message === 'Fabricante não encontrado' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /fabricantes
 * Criar novo fabricante
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

    const novoFabricante = await FabricanteService.criar(req.body);
    res.status(201).json({
      success: true,
      message: 'Fabricante criado com sucesso',
      data: novoFabricante
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /fabricantes/:id
 * Atualizar fabricante
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

    const fabricanteAtualizado = await FabricanteService.atualizar(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Fabricante atualizado com sucesso',
      data: fabricanteAtualizado
    });
  } catch (error) {
    const status = error.message === 'Fabricante não encontrado' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /fabricantes/:id
 * Deletar fabricante
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

    await FabricanteService.deletar(req.params.id);
    res.json({
      success: true,
      message: 'Fabricante excluído com sucesso'
    });
  } catch (error) {
    const status = error.message === 'Fabricante não encontrado' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
