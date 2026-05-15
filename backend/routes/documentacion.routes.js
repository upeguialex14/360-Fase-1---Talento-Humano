const express = require('express');
const router = express.Router();
const DocumentacionController = require('../controllers/documentacion.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Obtenemos los datos para crear carpeta por identificación
        let identification = 'sin_identificar';
        try {
            if (req.body.data) {
                const data = JSON.parse(req.body.data);
                identification = data.identificacion || identification;
            }
        } catch (e) {
            console.error('Error parseando data en multer:', e);
        }

        const uploadPath = path.join(__dirname, '../uploads/documentacion', identification.toString());
        
        // Crear carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB límite por archivo
});

// Definición de Rutas
router.post('/vinculacion', upload.any(), DocumentacionController.submitVinculacion);
router.get('/vinculaciones', DocumentacionController.getVinculaciones);
router.get('/vinculaciones/:id', DocumentacionController.getVinculacionDetail);
router.patch('/vinculacion/documento/:id', DocumentacionController.updateDocStatus);

module.exports = router;
