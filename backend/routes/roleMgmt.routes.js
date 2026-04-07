const express = require('express');
const router = express.Router();
const roleMgmtController = require('../controllers/roleManagement.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// Todas estas rutas requieren ADMIN (o permisos específicos de gestión)
// De momento usaremos checkPermission('ADMIN_ACCESS') o similar si existe, 
// o simplemente validaremos por rol ADMIN.

const rolePageController = require('../controllers/rolePage.controller');

router.get('/roles', verifyToken, checkPermission('MANAGE_ROLES'), roleMgmtController.getRoles);
router.post('/roles', verifyToken, checkPermission('MANAGE_ROLES'), roleMgmtController.createRole);

router.get('/permissions', verifyToken, checkPermission('MANAGE_PERMISSIONS'), roleMgmtController.getPermissions);
router.post('/permissions', verifyToken, checkPermission('MANAGE_PERMISSIONS'), roleMgmtController.createPermission);

router.get('/role-permissions', verifyToken, checkPermission('MANAGE_ROLE_PERMISSIONS'), roleMgmtController.getRolePermissions);
router.post('/role-permissions', verifyToken, checkPermission('MANAGE_ROLE_PERMISSIONS'), roleMgmtController.assignPermissionToRole);
router.delete('/role-permissions/:role_permission_id', verifyToken, checkPermission('MANAGE_ROLE_PERMISSIONS'), roleMgmtController.revokePermissionFromRole);

// Nuevas rutas para gestión de páginas por rol
router.get('/roles/:role_code/pages', verifyToken, checkPermission('MANAGE_ROLES'), rolePageController.getRolePages);
router.put('/roles/:role_code/pages', verifyToken, checkPermission('MANAGE_ROLES'), rolePageController.updateRolePages);

module.exports = router;
