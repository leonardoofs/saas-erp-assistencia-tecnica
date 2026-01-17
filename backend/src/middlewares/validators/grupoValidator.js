/**
 * Validadores para Grupos
 */

const { body, param } = require('express-validator');
const GrupoRepository = require('../../repositories/grupoRepository');

const createValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .custom(async (nome) => {
      const grupoExistente = await GrupoRepository.findByNome(nome);
      if (grupoExistente) {
        throw new Error('Já existe um grupo com este nome');
      }
      return true;
    }),

  body('cor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)'),

  body('ativo')
    .optional()
    .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso')
    .toBoolean()
];

const updateValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
    .toInt(),

  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('cor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)'),

  body('ativo')
    .optional()
    .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso')
    .toBoolean()
];

const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
    .toInt()
];

module.exports = {
  createValidation,
  updateValidation,
  idValidation
};
