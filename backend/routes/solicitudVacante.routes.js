const express = require('express');
const router = express.Router();
const SolicitudVacanteController = require('../controllers/solicitudVacante.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Todas las rutas requieren token
router.use(verifyToken);

// Obtener todas las solicitudes
router.get('/', SolicitudVacanteController.getAll);

// Obtener por ID
router.get('/:id', SolicitudVacanteController.getById);

// Crear solicitud (Requiere permiso de edición en la página)
router.post('/', checkPageAccess('SOLICITUD_VACANTES', 'edit'), SolicitudVacanteController.create);

// Actualizar solicitud
router.put('/:id', checkPageAccess('SOLICITUD_VACANTES', 'edit'), SolicitudVacanteController.update);

// Enviar solicitud
router.post('/:id/enviar', checkPageAccess('SOLICITUD_VACANTES', 'edit'), SolicitudVacanteController.enviar);

module.exports = router;
