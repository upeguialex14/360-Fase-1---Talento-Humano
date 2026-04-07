const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

// Listar usuarios (requiere token y permiso)
router.get('/', verifyToken, checkPermission('LIST_USERS'), userController.getUsers);

// Cambiar contraseña de usuario (requiere token y permiso)
router.put('/:userId/change-password', verifyToken, checkPermission('CHANGE_USER_PWD'), userController.updateUserPassword);

module.exports = router;
