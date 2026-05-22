const express = require('express');
const router = express.Router();
const pendingAccessController = require('../controllers/pendingAccess.controller');
const verifyToken = require('../middleware/auth.middleware');
// const verifyRole = require('../middleware/role.middleware'); // Not used currently

// Rutas protegidas para gerentes (role_id: 1, o roles autorizados)
// Asumimos que verifyRole(1) asegura que sea Gerente. De lo contrario, usar rol específico
router.get('/', verifyToken, pendingAccessController.getPendingAccesses);
router.post('/:id/approve', verifyToken, pendingAccessController.approveAccess);
router.post('/:id/reject', verifyToken, pendingAccessController.rejectAccess);

module.exports = router;
