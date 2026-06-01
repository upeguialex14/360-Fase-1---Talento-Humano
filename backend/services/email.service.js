/**
 * Servicio Centralizado de Correo Electrónico (Nodemailer)
 * Gestiona el envío de correos utilizando la configuración del archivo .env
 */
const nodemailer = require('nodemailer');
require('dotenv').config();

let transporterInstance = null;

/**
 * Obtiene o crea la instancia única del transportador de nodemailer.
 * De esta manera se evita instanciar múltiples transportadores innecesariamente.
 */
function getTransporter() {
    if (transporterInstance) {
        return transporterInstance;
    }

    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

    transporterInstance = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    return transporterInstance;
}

const EmailService = {
    /**
     * Envía un correo electrónico de forma segura.
     * @param {Object} options - Parámetros del envío
     * @param {string} [options.from] - Remitente (opcional, usa EMAIL_USER por defecto)
     * @param {string} options.to - Destinatario
     * @param {string} options.subject - Asunto del correo
     * @param {string} [options.text] - Contenido en texto plano
     * @param {string} [options.html] - Contenido en HTML
     * @param {Array} [options.attachments] - Archivos adjuntos
     * @returns {Promise<Object>} Resultado del envío ({ success: true, messageId } o { success: false, error })
     */
    async sendMail({ from, to, subject, text, html, attachments }) {
        const sender = from || `"Gestión 365" <${process.env.EMAIL_USER}>`;
        
        try {
            const transporter = getTransporter();
            const info = await transporter.sendMail({
                from: sender,
                to,
                subject,
                text,
                html,
                attachments
            });

            console.log(`[EMAIL_SERVICE] ✅ Correo enviado con éxito a: ${to}. MessageId: ${info.messageId}`);
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            console.error(`[EMAIL_SERVICE] ❌ Fallo al enviar correo a: ${to}. Error:`, error.message);
            
            // Si hay un error de credenciales específico de Google
            if (error.message.includes('535-5.7.8')) {
                console.error('[EMAIL_SERVICE] 🔐 ERROR DE AUTENTICACIÓN: La contraseña de aplicación en el .env es inválida o fue revocada.');
            }

            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Verifica la validez de la configuración SMTP.
     * Útil para diagnósticos o pruebas de salud.
     */
    async verifyConnection() {
        try {
            const transporter = getTransporter();
            await transporter.verify();
            return { success: true };
        } catch (error) {
            console.error('[EMAIL_SERVICE] ❌ Error de verificación de conexión SMTP:', error.message);
            return { success: false, error: error.message };
        }
    }
};

module.exports = EmailService;
