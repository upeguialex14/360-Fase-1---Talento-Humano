const express = require('express');
const router = express.Router();
const controller = require('../../controllers/etl/masiveUploadExcel.controller');
const middleware = require('../../middleware/etl/masiveUploadExcel.middleware');
const verifyToken = require('../../middleware/auth.middleware');

router.use(verifyToken);

router.post('/upload/:type', middleware.uploadExcel, controller.controllerUploadExcel);
router.get('/cost-centers', controller.getCostCenters);
router.get('/base-datos', controller.getBaseDatos);

router.delete('/cost-centers', controller.deleteAllCostCenters);
router.delete('/base-datos', controller.deleteAllBaseDatos);

module.exports = router;