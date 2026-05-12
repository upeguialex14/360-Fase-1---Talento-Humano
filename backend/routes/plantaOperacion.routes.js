const express = require('express');
const router = express.Router();
const plantaOperacionController = require('../controllers/plantaOperacion.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Obtener todos los registros de la planta de operación
router.get('/', verifyToken, checkPageAccess('PLANTA', 'can_view'), plantaOperacionController.getAllPlantaOperaciones);

// Crear un nuevo registro en planta de operación
router.post('/', verifyToken, checkPageAccess('PLANTA', 'can_edit'), plantaOperacionController.createPlantaOperacion);

// Obtener detalles de oficina para auto-llenado
router.get('/oficina/:oficinaName', verifyToken, checkPageAccess('PLANTA', 'can_view'), plantaOperacionController.getOficinaDetails);

module.exports = router;
