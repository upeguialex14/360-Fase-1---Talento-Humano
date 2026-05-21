const express = require('express');
const router = express.Router();
const plantaOperacionController = require('../controllers/plantaOperacion.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Obtener todos los registros de la planta de operación
router.get('/', verifyToken, checkPageAccess('PLANTA', 'can_view'), plantaOperacionController.getAllPlantaOperaciones);

// Crear un nuevo registro en planta de operación
router.post('/', verifyToken, checkPageAccess('PLANTA', 'can_edit'), plantaOperacionController.createPlantaOperacion);

// Actualizar un registro existente
router.put('/:id', verifyToken, checkPageAccess('PLANTA', 'can_edit'), plantaOperacionController.updatePlantaOperacion);

// Obtener detalles de oficina para auto-llenado
router.get('/oficina/:oficinaName', verifyToken, checkPageAccess('PLANTA', 'can_view'), plantaOperacionController.getOficinaDetails);

// Enviar credenciales SAHG
router.post('/:id/enviar-credenciales', verifyToken, checkPageAccess('USUARIO_SAHG', 'can_edit'), plantaOperacionController.enviarCredencialesSahg);

module.exports = router;
