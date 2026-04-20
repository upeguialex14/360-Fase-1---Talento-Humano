const express = require('express');
const router = express.Router();
const requisicionController = require('../controllers/requisicion.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Rutas CRUD
router.get('/', requisicionController.getAll);
router.get('/estadisticas', requisicionController.getEstadisticas);
router.get('/analistas', requisicionController.getAnalistas);
router.get('/exportar', requisicionController.exportarCSV);
router.get('/:id', requisicionController.getById);
router.post('/', requisicionController.create);
router.put('/:id', requisicionController.update);
router.delete('/:id', requisicionController.delete);

module.exports = router;