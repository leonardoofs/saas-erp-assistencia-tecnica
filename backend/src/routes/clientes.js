const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  validateCreateCliente,
  validateUpdateCliente,
  validateClienteId,
  validateListClientes
} = require('../middlewares/validators/clienteValidator');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas CRUD de clientes com validações
router.get('/', validateListClientes, clientesController.listarClientes);
router.get('/:id', validateClienteId, clientesController.buscarCliente);
router.post('/', validateCreateCliente, clientesController.criarCliente);
router.put('/:id', validateUpdateCliente, clientesController.atualizarCliente);
router.delete('/:id', validateClienteId, clientesController.deletarCliente);

module.exports = router;