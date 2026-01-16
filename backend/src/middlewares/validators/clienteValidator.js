/**
 * UnderTech - Validadores para Clientes
 * Validações usando express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para processar erros de validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erros de validação',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

/**
 * Validações para criação de cliente
 */
const validateCreateCliente = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),

  body('cpf')
    .optional({ nullable: true })
    .trim()
    .matches(/^\d{11}$/).withMessage('CPF deve conter exatamente 11 dígitos numéricos'),

  body('telefone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório')
    .custom((value) => {
      // Permitir valores como "Não informado" ou validar formato de telefone
      if (value === 'Não informado' || value === null) {
        return true;
      }
      // Validar formato de telefone brasileiro
      const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
      if (!telefoneRegex.test(value)) {
        throw new Error('Telefone deve estar no formato (99) 99999-9999 ou (99) 9999-9999');
      }
      return true;
    }),

  body('telefone_contato')
    .optional({ nullable: true })
    .trim()
    .matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).withMessage('Telefone de contato inválido'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('situacao')
    .optional()
    .isIn(['ativo', 'em_risco', 'inativo']).withMessage('Situação inválida'),

  body('responsavel')
    .trim()
    .notEmpty().withMessage('Responsável é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Responsável deve ter entre 3 e 100 caracteres'),

  body('endereco')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Endereço deve ter no máximo 200 caracteres'),

  body('cidade')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres'),

  body('estado')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres (UF)')
    .toUpperCase(),

  body('cep')
    .optional({ nullable: true })
    .trim()
    .matches(/^\d{8}$/).withMessage('CEP deve conter exatamente 8 dígitos'),

  body('observacoes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Observações deve ter no máximo 500 caracteres'),

  handleValidationErrors
];

/**
 * Validações para atualização de cliente
 */
const validateUpdateCliente = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),

  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),

  body('cpf')
    .optional({ nullable: true })
    .trim()
    .matches(/^\d{11}$/).withMessage('CPF deve conter exatamente 11 dígitos numéricos'),

  body('telefone')
    .optional()
    .trim()
    .custom((value) => {
      // Permitir valores como "Não informado" ou validar formato de telefone
      if (value === 'Não informado' || value === null || value === '') {
        return true;
      }
      // Validar formato de telefone brasileiro
      const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
      if (!telefoneRegex.test(value)) {
        throw new Error('Telefone deve estar no formato (99) 99999-9999 ou (99) 9999-9999');
      }
      return true;
    }),

  body('telefone_contato')
    .optional({ nullable: true })
    .trim()
    .matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/).withMessage('Telefone de contato inválido'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('situacao')
    .optional()
    .isIn(['ativo', 'em_risco', 'inativo']).withMessage('Situação inválida'),

  body('responsavel')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Responsável deve ter entre 3 e 100 caracteres'),

  body('endereco')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Endereço deve ter no máximo 200 caracteres'),

  body('cidade')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Cidade deve ter no máximo 100 caracteres'),

  body('estado')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres (UF)')
    .toUpperCase(),

  body('cep')
    .optional({ nullable: true })
    .trim()
    .matches(/^\d{8}$/).withMessage('CEP deve conter exatamente 8 dígitos'),

  body('observacoes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Observações deve ter no máximo 500 caracteres'),

  handleValidationErrors
];

/**
 * Validações para buscar/deletar cliente por ID
 */
const validateClienteId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),

  handleValidationErrors
];

/**
 * Validações para listagem com paginação
 */
const validateListClientes = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Busca deve ter no máximo 100 caracteres'),

  handleValidationErrors
];

module.exports = {
  validateCreateCliente,
  validateUpdateCliente,
  validateClienteId,
  validateListClientes,
  handleValidationErrors
};
