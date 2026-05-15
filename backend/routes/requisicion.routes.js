const express = require('express');
const router = express.Router();
const requisicionController = require('../controllers/requisicion.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Rutas CRUD con middleware aplicado correctamente
router.get('/', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_view'), requisicionController.getAll);
router.get('/estadisticas', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_view'), requisicionController.getEstadisticas);
router.get('/analistas', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_view'), requisicionController.getAnalistas);
router.get('/exportar', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_view'), requisicionController.exportarCSV);
router.get('/:id', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_view'), requisicionController.getById);
router.post('/', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_edit'), requisicionController.create);
router.put('/:id', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_edit'), requisicionController.update);
router.delete('/:id', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_edit'), requisicionController.delete);

// Rutas de Historial y Candidatos
router.get('/:id/historial', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_view'), requisicionController.getHistorial);
router.get('/:id/candidatos', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_view'), requisicionController.getCandidatos);
router.post('/:id/candidatos', verifyToken, checkPageAccess('GESTION_REQUISICIONES', 'can_edit'), requisicionController.addCandidato);

module.exports = router;