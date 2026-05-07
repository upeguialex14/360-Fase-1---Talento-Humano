const express = require('express');
const router = express.Router();
const plantaOperacionController = require('../controllers/plantaOperacion.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Obtener todos los registros de la planta de operación
router.get('/', verifyToken, checkPageAccess('PLANTA', 'can_view'), plantaOperacionController.getAllPlantaOperaciones);

module.exports = router;
