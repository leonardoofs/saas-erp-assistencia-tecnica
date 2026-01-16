/**
 * UnderTech - Validadores para Autenticação
 * Validações usando express-validator
 */

const { body, validationResult } = require('express-validator');

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
        message: err.msg
      }))
    });
  }

  next();
};

/**
 * Validações para login
 */
const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Usuário é obrigatório')
    .isLength({ min: 3, max: 50 }).withMessage('Usuário deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Usuário deve conter apenas letras, números e underscore'),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),

  handleValidationErrors
];

/**
 * Validações para registro
 */
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Usuário é obrigatório')
    .isLength({ min: 3, max: 50 }).withMessage('Usuário deve ter entre 3 e 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Usuário deve conter apenas letras, números e underscore'),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6, max: 100 }).withMessage('Senha deve ter entre 6 e 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),

  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  handleValidationErrors
};
