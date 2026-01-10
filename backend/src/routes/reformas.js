const express = require('express');
const router = express.Router();
const reformasController = require('../controllers/reformasController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas CRUD de reformas
router.get('/', reformasController.listarReformas);
router.get('/:id', reformasController.buscarReforma);
router.post('/', reformasController.criarReforma);
router.put('/:id', reformasController.atualizarReforma);
router.delete('/:id', reformasController.deletarReforma);

module.exports = router;