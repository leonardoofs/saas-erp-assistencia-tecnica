/**
 * Validadores para Subgrupos
 */

const { body, param } = require('express-validator');
const SubgrupoRepository = require('../../repositories/subgrupoRepository');

const createValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('grupo_id')
    .notEmpty().withMessage('Grupo é obrigatório')
    .isInt({ min: 1 }).withMessage('Grupo inválido')
    .toInt(),

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

  body('grupo_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Grupo inválido')
    .toInt(),

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
