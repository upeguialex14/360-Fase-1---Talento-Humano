/**
 * Servicio de Notificaciones por Email para Dotación
 */
let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    console.warn('[DOTACION] Nodemailer no está instalado. Los correos se registrarán solo en consola.');
}

const DotacionEmailService = {

    /**
     * Envía el link de firma al empleado
     */
    async sendSignatureLink(delivery, token, frontendUrl) {
        const signUrl = `${frontendUrl.replace(/\/$/, '')}/sign/${token}`;
        const employeeEmail = delivery.email || 'correo_no_encontrado@empresa.com';

        const subject = `Dotación Gestion365 - Firma Pendiente (${delivery.period_year}-${delivery.period_number})`;
        
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #2c3e50;">¡Tu dotación está lista!</h2>
                <p>Hola <strong>${delivery.full_name}</strong>,</p>
                <p>Se ha generado tu entrega de dotación correspondiente al período <strong>${delivery.period_number} del año ${delivery.period_year}</strong>.</p>
                <p>Para completar el proceso y recibir tus prendas, por favor firma digitalmente en el siguiente enlace:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${signUrl}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Firmar Entrega Aquí
                    </a>
                </div>
                
                <p style="font-size: 0.9em; color: #7f8c8d;">
                    Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                    <a href="${signUrl}">${signUrl}</a>
                </p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8em; color: #bdc3c7;">
                    Este es un correo automático, por favor no respondas.
                </p>
            </div>
        `;

        if (!nodemailer) {
            console.log('--------------------------------------------------');
            console.log(`📧 [EMAIL SIMULADO] Enviado a: ${employeeEmail}`);
            console.log(`🔗 Link: ${signUrl}`);
            console.log('--------------------------------------------------');
            return { success: true, simulated: true, url: signUrl };
        }

        // Si nodemailer está instalado, intentar enviar
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `"Gestion365 Talentum" <${process.env.EMAIL_USER}>`,
                to: employeeEmail,
                subject: subject,
                html: html
            });

            return { success: true, sent: true };
        } catch (error) {
            console.error('[DOTACION] Error enviando email real:', error);
            return { success: false, error: error.message, url: signUrl };
        }
    }
};

module.exports = DotacionEmailService;
