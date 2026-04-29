const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

// Endpoint de login (público)
router.post('/login', authController.login);

// Endpoint de cambio de contraseña (protegido)
router.post('/change-password', verifyToken, authController.changePassword);

// Logout: actualiza historial de sesiones
router.post('/logout', verifyToken, authController.logout);

// Consultar última sesión del usuario (para mostrar en menú)
router.get('/last-session', verifyToken, authController.getLastSession);

// Endpoint de forzado manual para DEMOSTRACIÓN (protegido, rol Gerente verificado en controlador)
router.post('/force-expire-demo', verifyToken, authController.forcePasswordChangeDemo);

module.exports = router;
