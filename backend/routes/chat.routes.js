const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Servicio de Google Chat (Domain-Wide Delegation)
const googleChatService = require('../services/googleChat.service');

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

// ──────────────────────────────────────────────────────────────────────────────
// RUTAS EXISTENTES - Suri Intercomunicador (DB + Socket.io) — NO MODIFICADAS
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// NUEVAS RUTAS — Google Chat API (Domain-Wide Delegation)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/chat/send
 * Envía un mensaje a Google Chat suplantando al usuario activo en sesión.
 * Body: { userEmail, spaceId, messageText }
 *
 * Requiere que la Cuenta de Servicio tenga Domain-Wide Delegation habilitada
 * y que el usuario (userEmail) pertenezca al dominio de Google Workspace.
 */
router.post('/send', async (req, res) => {
    try {
        const { userEmail, spaceId, messageText } = req.body;

        // Validación de parámetros
        if (!userEmail || !spaceId || !messageText) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los campos: userEmail, spaceId y messageText'
            });
        }

        // Llamar al servicio que usa JWT con subject = userEmail
        const result = await googleChatService.sendMessage(userEmail, spaceId, messageText);

        return res.status(200).json({
            success: true,
            message: 'Mensaje enviado a Google Chat correctamente',
            data: result
        });

    } catch (error) {
        console.error('[POST /api/chat/send] Error al enviar mensaje a Google Chat:', error.message);

        // Retornamos un mensaje amigable sin exponer detalles de la llave
        return res.status(500).json({
            success: false,
            message: 'No se pudo enviar el mensaje a Google Chat. Verifica la configuración de Domain-Wide Delegation.',
            error: error.message
        });
    }
});

/**
 * POST /api/chat/webhook
 * Endpoint receptor de eventos desde Google Chat (mensajes entrantes, reacciones, etc.)
 * Google Chat llama este endpoint cuando alguien responde en el espacio configurado.
 *
 * Para activarlo: En Google Cloud Console → API de Chat → configurar la URL del bot
 * como "https://TU_DOMINIO/api/chat/webhook"
 */
router.post('/webhook', async (req, res) => {
    try {
        const event = req.body;

        console.log('[Google Chat Webhook] Evento recibido:', JSON.stringify(event, null, 2));

        // Tipo de evento que envía Google Chat
        const eventType = event?.type;

        if (eventType === 'MESSAGE') {
            // Un usuario envió un mensaje en el espacio
            const sender = event?.message?.sender?.displayName || 'Desconocido';
            const text = event?.message?.text || '';
            console.log(`[Webhook] Mensaje de ${sender}: ${text}`);

            // Aquí puedes agregar lógica: guardar en DB, notificar por socket, etc.
        } else if (eventType === 'ADDED_TO_SPACE') {
            console.log('[Webhook] Bot añadido al espacio:', event?.space?.displayName);
        } else if (eventType === 'REMOVED_FROM_SPACE') {
            console.log('[Webhook] Bot removido del espacio:', event?.space?.displayName);
        }

        // Google Chat espera una respuesta 200 vacía o con un mensaje de texto opcional
        return res.status(200).json({ text: '' });

    } catch (error) {
        console.error('[POST /api/chat/webhook] Error procesando evento:', error.message);
        return res.status(500).json({ success: false, message: 'Error procesando evento de webhook' });
    }
});

module.exports = router;
