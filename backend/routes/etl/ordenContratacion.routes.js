const express = require('express');
const router = express.Router();
const controller = require('../../controllers/etl/ordenContratacion.controller');
const verifyToken = require('../../middleware/auth.middleware');
const { checkPageAccess } = require('../../middleware/permission.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Carga partial UPSERT
router.post('/upsert', checkPageAccess('ORDEN_CONTRATACION', 'can_edit'), controller.upsertRecords);

// Obtener registros para la tabla
router.get('/', checkPageAccess('ORDEN_CONTRATACION', 'can_view'), controller.getAllRecords);

// Guardado manual masivo
router.put('/bulk-update', checkPageAccess('ORDEN_CONTRATACION', 'can_edit'), controller.bulkUpdate);

// Eliminar todos los registros
router.delete('/', checkPageAccess('ORDEN_CONTRATACION', 'can_edit'), controller.deleteAllOrdenContratacion);

module.exports = router;
