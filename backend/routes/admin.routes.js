const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth.middleware');

// Lista de usuarios bloqueados (ADMIN)
router.get('/blocked-users', verifyToken, adminController.getBlockedUsers);

// Desbloquear usuario por ID (ADMIN)
router.put('/unlock-user/:id', verifyToken, adminController.unlockUser);

// Historial de actividad de login (ADMIN)
router.get('/user-activity', verifyToken, adminController.getUserActivity);

module.exports = router;