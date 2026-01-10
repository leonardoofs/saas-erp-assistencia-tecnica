const express = require('express');
const router = express.Router();
const ordensController = require('../controllers/ordensController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas CRUD de ordens de serviço
router.get('/', ordensController.listarOrdens);
router.get('/:id', ordensController.buscarOrdem);
router.post('/', ordensController.criarOrdem);
router.put('/:id', ordensController.atualizarOrdem);
router.delete('/:id', ordensController.deletarOrdem);

module.exports = router;