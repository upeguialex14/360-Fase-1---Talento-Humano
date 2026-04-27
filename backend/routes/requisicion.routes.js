const express = require('express');
const router = express.Router();
const requisicionController = require('../controllers/requisicion.controller');
const verifyToken = require('../middleware/auth.middleware'); // 👈 importar directo

// Rutas CRUD con middleware aplicado correctamente
router.get('/', verifyToken, requisicionController.getAll);
router.get('/estadisticas', verifyToken, requisicionController.getEstadisticas);
router.get('/analistas', verifyToken, requisicionController.getAnalistas);
router.get('/exportar', verifyToken, requisicionController.exportarCSV);
router.get('/:id', verifyToken, requisicionController.getById);
router.post('/', verifyToken, requisicionController.create);
router.put('/:id', verifyToken, requisicionController.update);
router.delete('/:id', verifyToken, requisicionController.delete);

module.exports = router;