const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas do dashboard
router.get('/ordens-servico', dashboardController.getOrdensServico);
router.get('/reformas', dashboardController.getReformas);

module.exports = router;