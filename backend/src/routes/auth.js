const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  validateLogin,
  validateRegister
} = require('../middlewares/validators/authValidator');

// Rotas públicas com validações
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Rotas protegidas
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;