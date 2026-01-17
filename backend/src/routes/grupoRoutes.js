/**
 * Rotas da API de Grupos
 */

const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const GrupoService = require('../services/grupoService');
const { createValidation, updateValidation, idValidation } = require('../middlewares/validators/grupoValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * GET /grupos
 * Listar todos os grupos
 */
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    const grupos = await GrupoService.listar({
      ativo: ativo !== undefined ? ativo === 'true' || ativo === '1' : undefined
    });

    res.json({
      success: true,
      data: grupos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar grupos',
      error: error.message
    });
  }
});

/**
 * GET /grupos/:id
 * Buscar grupo por ID
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

    const grupo = await GrupoService.buscarPorId(req.params.id);
    res.json({
      success: true,
      data: grupo
    });
  } catch (error) {
    const status = error.message === 'Grupo não encontrado' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /grupos
 * Criar novo grupo
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

    const novoGrupo = await GrupoService.criar(req.body);
    res.status(201).json({
      success: true,
      message: 'Grupo criado com sucesso',
      data: novoGrupo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /grupos/:id
 * Atualizar grupo
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

    const grupoAtualizado = await GrupoService.atualizar(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Grupo atualizado com sucesso',
      data: grupoAtualizado
    });
  } catch (error) {
    const status = error.message === 'Grupo não encontrado' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /grupos/:id
 * Deletar grupo
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

    await GrupoService.deletar(req.params.id);
    res.json({
      success: true,
      message: 'Grupo excluído com sucesso'
    });
  } catch (error) {
    const status = error.message === 'Grupo não encontrado' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
