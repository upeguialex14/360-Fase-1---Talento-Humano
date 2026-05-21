const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/chat');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Obtener historial de chat uno a uno
router.get('/history/:meId/:contactId', async (req, res) => {
    try {
        const { meId, contactId } = req.params;
        
        const [rows] = await pool.query(
            `SELECT * FROM chat_messages 
             WHERE is_group = FALSE 
             AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
             ORDER BY created_at ASC`,
            [meId, contactId, contactId, meId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo historial' });
    }
});

// Obtener historial grupal
router.get('/history/group', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM chat_messages WHERE is_group = TRUE ORDER BY created_at ASC`
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error obteniendo historial grupal:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo historial grupal' });
    }
});

// Subir un archivo
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se envió ningún archivo' });
    }
    
    // Devolvemos la ruta relativa para que el frontend pueda armar la URL
    const fileUrl = `/uploads/chat/${req.file.filename}`;
    res.json({ 
        success: true, 
        fileUrl, 
        fileType: req.file.mimetype 
    });
});

module.exports = router;
