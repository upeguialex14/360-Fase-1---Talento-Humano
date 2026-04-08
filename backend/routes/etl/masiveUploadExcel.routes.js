const express = require('express');
const router = express.router();
const controller = require('../controllers/etl/masiveUploadExcel.controller');
const middleware = require('../middleware/etl/masiveUploadExcel.middleware');
const verifyToken = require('../../middleware/auth.middleware');

router.use(verifyToken);

router.post('/upload', middleware.uploadExcel, controller.uploadExcel);

module.exports = router;