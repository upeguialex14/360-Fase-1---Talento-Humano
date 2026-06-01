/**
 * Servicio de Notificaciones por Email para Dotación
 */
const emailService = require('../email.service');
let xlsx;
try {
    xlsx = require('xlsx');
} catch (e) {
    console.warn('[DOTACION] xlsx no está instalado. Los correos se registrarán solo en consola.');
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

        if (!process.env.EMAIL_USER) {
            console.log('--------------------------------------------------');
            console.log(`📧 [EMAIL SIMULADO] Enviado a: ${employeeEmail}`);
            console.log(`🔗 Link: ${signUrl}`);
            console.log('--------------------------------------------------');
            return { success: true, simulated: true, url: signUrl };
        }

        // Intentar enviar con el servicio de correo
        try {
            const result = await emailService.sendMail({
                from: `"Gestion365 Talentum" <${process.env.EMAIL_USER}>`,
                to: employeeEmail,
                subject: subject,
                html: html
            });

            if (result.success) {
                return { success: true, sent: true };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('[DOTACION] Error enviando email real:', error);
            return { success: false, error: error.message, url: signUrl };
        }
    },

    /**
     * Envía la orden en formato Excel al proveedor
     */
    async sendProviderExcel(email, nombre, notas, jsonDatos) {
        if (!xlsx || !process.env.EMAIL_USER) {
            console.log('--------------------------------------------------');
            console.log(`📧 [EMAIL SIMULADO] Enviado a Proveedor: ${email}`);
            console.log(`📎 Adjunto: Excel con ${jsonDatos.length} registros simulado.`);
            console.log('--------------------------------------------------');
            return { success: true, simulated: true };
        }

        try {
            // 1. Crear el buffer del Excel
            const ws = xlsx.utils.json_to_sheet(jsonDatos);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, "Solicitudes Dotación");
            const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

            const subject = `Nueva Orden de Dotación - Gestion365`;
            const html = `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #2c3e50;">Solicitud de Dotación</h2>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Adjunto a este correo encontrará un archivo Excel con la nueva orden de dotación solicitada.</p>
                    ${notas ? `<p><strong>Notas Adicionales:</strong><br>${notas.replace(/\\n/g, '<br>')}</p>` : ''}
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8em; color: #bdc3c7;">
                        Este es un correo automático de Gestión 365.
                    </p>
                </div>
            `;

            // 2. Enviar el correo con el adjunto usando el servicio centralizado
            const result = await emailService.sendMail({
                from: `"Gestion365 Talentum" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: subject,
                html: html,
                attachments: [
                    {
                        filename: `Orden_Dotacion_${new Date().toISOString().slice(0, 10)}.xlsx`,
                        content: excelBuffer
                    }
                ]
            });

            if (result.success) {
                return { success: true, sent: true };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('[DOTACION] Error enviando Excel al proveedor:', error);
            throw new Error('No se pudo enviar el correo al proveedor: ' + error.message);
        }
    }
};

module.exports = DotacionEmailService;
