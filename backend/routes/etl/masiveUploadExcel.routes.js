const express = require('express');
const router = express.Router();
const controller = require('../controllers/etl/masiveUploadExcel.controller');
const middleware = require('../middleware/etl/masiveUploadExcel.middleware');
const verifyToken = require('../../middleware/auth.middleware');

router.use(verifyToken);

router.post('/upload/:type', middleware.uploadExcel, controller.uploadExcel);

module.exports = router;