/**
 * Validadores para Garantias
 */

const { body, param } = require('express-validator');
const GarantiaRepository = require('../../repositories/garantiaRepository');

const createValidation = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres')
    .custom(async (nome) => {
      const garantiaExistente = await GarantiaRepository.findByNome(nome);
      if (garantiaExistente) {
        throw new Error('Já existe uma garantia com este nome');
      }
      return true;
    }),

  body('meses')
    .notEmpty().withMessage('Meses é obrigatório')
    .isInt({ min: 0 }).withMessage('Meses deve ser um número inteiro maior ou igual a zero')
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
    .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres'),

  body('meses')
    .optional()
    .isInt({ min: 0 }).withMessage('Meses deve ser um número inteiro maior ou igual a zero')
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
