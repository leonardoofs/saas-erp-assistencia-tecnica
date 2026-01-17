/**
 * Validadores para Produtos
 */

const { body, param } = require('express-validator');
const ProdutoRepository = require('../../repositories/produtoRepository');

const createValidation = [
  body('codigo')
    .trim()
    .notEmpty().withMessage('Código é obrigatório')
    .isLength({ min: 1, max: 50 }).withMessage('Código deve ter entre 1 e 50 caracteres')
    .custom(async (codigo) => {
      const produtoExistente = await ProdutoRepository.findByCodigo(codigo);
      if (produtoExistente) {
        throw new Error('Código já está em uso');
      }
      return true;
    }),

  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),

  body('grupo_id')
    .notEmpty().withMessage('Grupo é obrigatório')
    .isInt({ min: 1 }).withMessage('Grupo inválido')
    .toInt(),

  body('subgrupo_id')
    .notEmpty().withMessage('Subgrupo é obrigatório')
    .isInt({ min: 1 }).withMessage('Subgrupo inválido')
    .toInt(),

  body('garantia_id')
    .notEmpty().withMessage('Garantia é obrigatória')
    .isInt({ min: 1 }).withMessage('Garantia inválida')
    .toInt(),

  body('fabricante_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Fabricante inválido')
    .toInt(),

  body('imei_serie')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('IMEI/Série muito longo'),

  body('cor')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Cor muito longa'),

  body('armazenamento')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Armazenamento muito longo'),

  body('estoque_atual')
    .notEmpty().withMessage('Estoque atual é obrigatório')
    .isInt({ min: 0 }).withMessage('Estoque atual deve ser maior ou igual a zero')
    .toInt(),

  body('estoque_minimo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Estoque mínimo deve ser maior ou igual a zero')
    .toInt(),

  body('estoque_maximo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Estoque máximo deve ser maior ou igual a zero')
    .toInt(),

  body('preco_custo')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo')
    .toFloat(),

  body('preco_venda')
    .notEmpty().withMessage('Preço de venda é obrigatório')
    .isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo')
    .toFloat(),

  body('descricao')
    .optional()
    .trim(),

  body('observacoes')
    .optional()
    .trim(),

  body('ativo')
    .optional()
    .isBoolean().withMessage('Ativo deve ser verdadeiro ou falso')
    .toBoolean()
];

const updateValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
    .toInt(),

  body('codigo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Código deve ter entre 1 e 50 caracteres'),

  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),

  body('grupo_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Grupo inválido')
    .toInt(),

  body('subgrupo_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Subgrupo inválido')
    .toInt(),

  body('garantia_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Garantia inválida')
    .toInt(),

  body('fabricante_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Fabricante inválido')
    .toInt(),

  body('imei_serie')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('IMEI/Série muito longo'),

  body('cor')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Cor muito longa'),

  body('armazenamento')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Armazenamento muito longo'),

  body('estoque_atual')
    .optional()
    .isInt({ min: 0 }).withMessage('Estoque atual deve ser maior ou igual a zero')
    .toInt(),

  body('estoque_minimo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Estoque mínimo deve ser maior ou igual a zero')
    .toInt(),

  body('estoque_maximo')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Estoque máximo deve ser maior ou igual a zero')
    .toInt(),

  body('preco_custo')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Preço de custo deve ser positivo')
    .toFloat(),

  body('preco_venda')
    .optional()
    .isFloat({ min: 0 }).withMessage('Preço de venda deve ser positivo')
    .toFloat(),

  body('descricao')
    .optional()
    .trim(),

  body('observacoes')
    .optional()
    .trim(),

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
