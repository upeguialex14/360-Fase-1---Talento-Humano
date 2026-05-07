const express = require('express');
const router = express.Router();
const roleMgmtController = require('../controllers/roleManagement.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Todas estas rutas requieren ADMIN (o permisos específicos de gestión)
// De momento usaremos checkPermission('ADMIN_ACCESS') o similar si existe, 
// o simplemente validaremos por rol ADMIN.

const rolePageController = require('../controllers/rolePage.controller');

router.get('/roles', verifyToken, checkPageAccess('ROLES', 'can_view'), roleMgmtController.getRoles);
router.get('/roles/:role_id/users', verifyToken, checkPageAccess('ROLES', 'can_view'), roleMgmtController.getUsersByRole);
router.post('/roles', verifyToken, checkPageAccess('ROLES', 'can_edit'), roleMgmtController.createRole);

router.get('/permissions', verifyToken, checkPageAccess('ROLES', 'can_view'), roleMgmtController.getPermissions);
router.post('/permissions', verifyToken, checkPageAccess('ROLES', 'can_edit'), roleMgmtController.createPermission);

router.get('/role-permissions', verifyToken, checkPageAccess('ROLES', 'can_view'), roleMgmtController.getRolePermissions);
router.post('/role-permissions', verifyToken, checkPageAccess('ROLES', 'can_edit'), roleMgmtController.assignPermissionToRole);
router.delete('/role-permissions/:role_permission_id', verifyToken, checkPageAccess('ROLES', 'can_edit'), roleMgmtController.revokePermissionFromRole);

// Nuevas rutas para gestión de páginas por rol
router.get('/roles/:role_id/pages', verifyToken, checkPageAccess('ROLE_PAGE_ACCESS', 'can_view'), rolePageController.getRolePages);
router.put('/roles/:role_id/pages', verifyToken, checkPageAccess('ROLE_PAGE_ACCESS', 'can_edit'), rolePageController.updateRolePages);

module.exports = router;
