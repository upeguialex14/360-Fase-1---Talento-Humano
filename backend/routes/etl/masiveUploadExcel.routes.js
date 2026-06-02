const express = require('express');
const router = express.Router();
const controller = require('../../controllers/etl/masiveUploadExcel.controller');
const middleware = require('../../middleware/etl/masiveUploadExcel.middleware');
const verifyToken = require('../../middleware/auth.middleware');
const { checkPageAccess } = require('../../middleware/permission.middleware');

router.use(verifyToken);

// El controllerUploadExcel debe validar los permisos internamente según el tipo, o usamos un wrapper
const checkUploadPermission = (req, res, next) => {
    const type = req.params.type;
    let pageCode = null;
    if (type === 'cost-centers' || type === 'COST_CENTER') pageCode = 'COSTOS';
    else if (type === 'base-datos' || type === 'BASE_DATOS') pageCode = 'BASE_DATOS';
    else if (type === 'HIRING_ORDER') pageCode = 'ORDEN_CONTRATACION';
    else if (type === 'DOTACION') pageCode = 'DOTACION';

    if (!pageCode) return res.status(400).json({ success: false, message: 'Tipo no válido' });
    return checkPageAccess(pageCode, 'can_edit')(req, res, next);
};

router.post('/upload/:type', checkUploadPermission, middleware.uploadExcel, controller.controllerUploadExcel);
router.get('/cost-centers', checkPageAccess('COSTOS', 'can_view'), controller.getCostCenters);
router.get('/base-datos', checkPageAccess('BASE_DATOS', 'can_view'), controller.getBaseDatos);

router.delete('/cost-centers', checkPageAccess('COSTOS', 'can_edit'), controller.deleteAllCostCenters);
router.delete('/base-datos', checkPageAccess('BASE_DATOS', 'can_edit'), controller.deleteAllBaseDatos);
router.put('/base-datos/tallas', checkPageAccess('DOTACION', 'can_edit'), controller.updateBaseDatosSizes);
router.post('/base-datos/crear', checkPageAccess('BASE_DATOS', 'can_edit'), controller.createBaseDatosUser);

module.exports = router;