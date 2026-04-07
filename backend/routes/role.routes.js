const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const verifyToken = require('../middleware/auth.middleware');

// Consultar roles disponibles (protegido)
router.get('/', verifyToken, roleController.getRoles);

// Consultar permisos del usuario logueado
router.get('/my-permissions', verifyToken, roleController.getUserPermissions);

module.exports = router;
