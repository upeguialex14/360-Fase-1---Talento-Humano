'use strict';
require('dotenv').config();

const { GoogleAuth } = require('google-auth-library');
const { chat } = require('@googleapis/chat');

/**
 * Scopes para Bot Autónomo de Google Chat.
 */
const CHAT_SCOPES = [
    'https://www.googleapis.com/auth/chat.bot'
];

/**
 * Construye un cliente autenticado de Google Chat API
 * usando las credenciales directas de la Cuenta de Servicio (Bot).
 *
 * @returns {import('@googleapis/chat').chat_v1.Chat} - Instancia de Chat API
 */
function buildChatClient() {
    const privateKey = process.env.GOOGLE_CHAT_PRIVATE_KEY
        ? process.env.GOOGLE_CHAT_PRIVATE_KEY.replace(/\\n/g, '\n')
        : null;

    if (!privateKey || !process.env.GOOGLE_CHAT_CLIENT_EMAIL) {
        throw new Error(
            '[GoogleChat] Faltan variables de entorno: GOOGLE_CHAT_PRIVATE_KEY o GOOGLE_CHAT_CLIENT_EMAIL'
        );
    }

    const auth = new GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CHAT_CLIENT_EMAIL,
            private_key: privateKey,
        },
        scopes: CHAT_SCOPES,
    });

    return chat({ version: 'v1', auth });
}

/**
 * Envía un mensaje de texto a un espacio de Google Chat.
 * Como el Bot es quien envía, el nombre del usuario real se
 * agrega como prefijo en el cuerpo del mensaje.
 *
 * @param {string} userEmail   - Correo de la trabajadora (se pondrá en el texto)
 * @param {string} spaceId     - ID del espacio en Google Chat (ej: "spaces/XXXXXXXXX")
 * @param {string} messageText - Texto del mensaje a enviar
 * @returns {Promise<object>}  - Respuesta de la API de Google Chat
 */
async function sendMessage(userEmail, spaceId, messageText) {
    if (!userEmail || !spaceId || !messageText) {
        throw new Error('[GoogleChat] Parámetros inválidos: userEmail, spaceId y messageText son requeridos');
    }

    // Normaliza el spaceId
    const parent = spaceId.startsWith('spaces/') ? spaceId : `spaces/${spaceId}`;

    // Formatear el mensaje para saber quién lo envía
    const formattedText = `*[${userEmail}]:* ${messageText}`;

    const chatClient = buildChatClient();

    const response = await chatClient.spaces.messages.create({
        parent,
        requestBody: {
            text: formattedText,
        },
    });

    return response.data;
}

module.exports = { sendMessage, buildChatClient };

