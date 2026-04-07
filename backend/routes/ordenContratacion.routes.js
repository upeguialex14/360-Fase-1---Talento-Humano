const express = require('express');
const router = express.Router();
const controller = require('../controllers/ordenContratacion.controller');
const verifyToken = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Carga partial UPSERT
router.post('/upsert', controller.upsertRecords);

// Obtener registros para la tabla
router.get('/', controller.getAllRecords);

// Guardado manual masivo
router.put('/bulk-update', controller.bulkUpdate);

module.exports = router;
