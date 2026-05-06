const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Lista de usuarios bloqueados (Gerente)
router.get('/blocked-users', verifyToken, checkPageAccess('BLOCKED_USERS', 'can_view'), adminController.getBlockedUsers);

// Desbloquear usuario por ID (Gerente)
router.put('/unlock-user/:id', verifyToken, checkPageAccess('BLOCKED_USERS', 'can_edit'), adminController.unlockUser);

// Historial de actividad de login (Gerente)
router.get('/user-activity', verifyToken, checkPageAccess('DASHBOARD', 'can_view'), adminController.getUserActivity);

module.exports = router;