const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth.middleware');

// Lista de usuarios bloqueados (Gerente)
router.get('/blocked-users', verifyToken, adminController.getBlockedUsers);

// Desbloquear usuario por ID (Gerente)
router.put('/unlock-user/:id', verifyToken, adminController.unlockUser);

// Historial de actividad de login (Gerente)
router.get('/user-activity', verifyToken, adminController.getUserActivity);

module.exports = router;