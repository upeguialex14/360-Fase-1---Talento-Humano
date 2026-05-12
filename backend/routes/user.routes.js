const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const { checkPageAccess } = require('../middleware/permission.middleware');

// Listar usuarios (requiere token y acceso de visualización a la página USUARIOS)
router.get('/', verifyToken, checkPageAccess('USUARIOS', 'can_view'), userController.getUsers);

// Cambiar contraseña de usuario (requiere token y acceso de edición)
router.put('/:userId/change-password', verifyToken, checkPageAccess('USUARIOS', 'can_edit'), userController.updateUserPassword);

// Crear usuario (requiere token y acceso de edición)
router.post('/', verifyToken, checkPageAccess('USUARIOS', 'can_edit'), userController.createUser);

module.exports = router;
