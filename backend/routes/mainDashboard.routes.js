const express = require('express');
const router = express.Router();
const controller = require('../controllers/mainDashboard.controller');
const verifyToken = require('../middleware/auth.middleware');

// Ruta para obtener estadísticas globales del dashboard
router.get('/stats', verifyToken, controller.getGlobalStats);

module.exports = router;
