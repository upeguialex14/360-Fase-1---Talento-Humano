const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../email.service');

const DotacionFirmaService = {

    /**
     * Asegura que la tabla tenga las columnas necesarias para el flujo de firma.
     * Usa ALTER TABLE individual para evitar el error si alguna columna ya existe.
     */
    async ensureSignatureColumns() {
        const columns = [
            "ADD COLUMN estado_firma VARCHAR(50) DEFAULT 'Pendiente Envío'",
            "ADD COLUMN firma_token VARCHAR(255) NULL",
            "ADD COLUMN fecha_envio_firma DATETIME NULL",
            "ADD COLUMN fecha_firma DATETIME NULL",
            "ADD COLUMN firma_base64 LONGTEXT NULL",
            "ADD COLUMN correo_enviado VARCHAR(255) NULL"
        ];

        for (const col of columns) {
            try {
                await pool.execute(`ALTER TABLE DOTACION_SOLICITUD_PROVEEDOR_DETALLE ${col}`);
            } catch (error) {
                // ER_DUP_FIELDNAME (1060) = columna ya existe, ignorar
                if (error.code !== 'ER_DUP_FIELDNAME') {
                    console.warn('[FIRMA] Aviso al alterar tabla:', error.message);
                }
            }
        }
    },

    /**
     * Obtiene la lista de todos los colaboradores a los que se les pidió dotación,
     * combinando el historial con los detalles individuales.
     */
    async getAllSignatures() {
        await this.ensureSignatureColumns();

        const [rows] = await pool.execute(`
            SELECT 
                d.id, 
                h.fecha_envio AS fecha_solicitud, 
                d.nombres_apellidos, 
                d.cedula, 
                d.empresa, 
                d.talla_camisa,
                d.talla_pantalon,
                d.datos_completos,
                d.estado_firma,
                d.fecha_envio_firma,
                d.fecha_firma,
                d.firma_base64,
                d.correo_enviado
            FROM DOTACION_SOLICITUD_PROVEEDOR_DETALLE d
            JOIN DOTACION_SOLICITUD_PROVEEDOR_HISTORICO h ON d.historico_id = h.id
            ORDER BY h.fecha_envio DESC
        `);

        return rows.map(row => {
            let cargo = 'No especificado';
            let itemsCount = 0;

            try {
                if (row.datos_completos) {
                    const parsedData = typeof row.datos_completos === 'string'
                        ? JSON.parse(row.datos_completos)
                        : row.datos_completos;

                    cargo = parsedData['CARGO'] || parsedData['Cargo'] || 'No especificado';

                    Object.keys(parsedData).forEach(key => {
                        if (
                            key.toUpperCase().includes('CANTIDAD') &&
                            parsedData[key] &&
                            parsedData[key] !== '' &&
                            parsedData[key] !== 0
                        ) {
                            itemsCount += parseInt(parsedData[key]) || 1;
                        }
                    });
                }
            } catch (e) {
                console.warn('[FIRMA] Error parsing datos_completos for id', row.id);
            }

            return {
                ...row,
                cargo,
                itemsCount: itemsCount > 0 ? itemsCount : 1
            };
        });
    },

    /**
     * Genera un token único, busca el correo del colaborador en la BD,
     * envía el enlace de firma por correo y actualiza el estado del registro.
     */
    async sendSignatureRequest(detalleId, originHost) {
        // 1. Obtener el registro del colaborador
        const [rows] = await pool.execute(`
            SELECT d.*, h.fecha_envio
            FROM DOTACION_SOLICITUD_PROVEEDOR_DETALLE d
            JOIN DOTACION_SOLICITUD_PROVEEDOR_HISTORICO h ON d.historico_id = h.id
            WHERE d.id = ?
        `, [detalleId]);

        if (rows.length === 0) {
            throw new Error('Registro de dotación no encontrado');
        }

        const detalle = rows[0];

        // 2. Buscar el correo en la tabla maestra people
        let email = null;
        try {
            const [peopleRows] = await pool.execute(
                'SELECT email FROM people WHERE document_number = ?',
                [detalle.cedula]
            );
            if (peopleRows.length > 0 && peopleRows[0].email) {
                email = peopleRows[0].email;
            }
        } catch (e) {
            console.warn('[FIRMA] No se pudo consultar tabla people:', e.message);
        }

        // 3. Fallback: buscar email en datos_completos
        if (!email) {
            try {
                const parsed = typeof detalle.datos_completos === 'string'
                    ? JSON.parse(detalle.datos_completos)
                    : detalle.datos_completos;
                email = parsed['CORREO'] || parsed['EMAIL'] || parsed['Correo'] || null;
            } catch (e) {}
        }

        if (!email) {
            throw new Error('El colaborador no tiene un correo electrónico registrado en la base de datos');
        }

        // 4. Generar token único y actualizar BD
        const token = uuidv4();
        await pool.execute(`
            UPDATE DOTACION_SOLICITUD_PROVEEDOR_DETALLE 
            SET firma_token = ?, estado_firma = 'Pendiente Firma', fecha_envio_firma = NOW(), correo_enviado = ?
            WHERE id = ?
        `, [token, email, detalleId]);

        // 5. Construir el link de firma
        const frontendUrl = (originHost || 'http://localhost:5173').replace(/\/$/, '');
        const signUrl = `${frontendUrl}/firma-dotacion/${token}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background: #1a1a1a; padding: 24px; text-align: center;">
                    <h2 style="color: #FFCD04; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Entrega de Dotación</h2>
                </div>
                <div style="padding: 32px; background: #fff;">
                    <p style="color: #333; font-size: 16px;">Hola <strong>${detalle.nombres_apellidos}</strong>,</p>
                    <p style="color: #555;">Se ha tramitado tu solicitud de dotación para la empresa <strong>${detalle.empresa}</strong>.</p>
                    <p style="color: #555;">Para confirmar y formalizar la recepción de las prendas asignadas, debes leer y firmar digitalmente el acta de entrega:</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${signUrl}" 
                           style="background-color: #FFCD04; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                            ✍️ Leer y Firmar Documento
                        </a>
                    </div>
                    <p style="color: #888; font-size: 13px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                        <a href="${signUrl}" style="color: #3498db;">${signUrl}</a>
                    </p>
                </div>
                <div style="background: #f5f5f5; padding: 16px; text-align: center;">
                    <p style="color: #aaa; font-size: 11px; margin: 0;">Este es un correo automático generado por Gestión365. Por favor no respondas.</p>
                </div>
            </div>
        `;

        // 6. Intentar enviar el correo real; si falla, simular en consola
        try {
            const result = await emailService.sendMail({
                from: `"Gestión365 Talentum" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Firma Pendiente: Acta de Entrega de Dotación',
                html: html
            });

            if (result.success) {
                console.log(`[FIRMA] ✅ Correo enviado a ${email}`);
                return { success: true, email, simulated: false };
            } else {
                throw new Error(result.error);
            }

        } catch (emailError) {
            console.warn('[FIRMA] ⚠️  No se pudo enviar el correo real. Modo simulado activado.');
            console.log('========================================');
            console.log('📧  EMAIL SIMULADO');
            console.log(`   Para: ${email}`);
            console.log(`   Enlace de Firma: ${signUrl}`);
            console.log('========================================');
            return {
                success: true,
                email,
                simulated: true,
                link: signUrl,
                warning: 'Correo simulado. Revisa la consola del backend para el enlace.'
            };
        }
    },

    /**
     * Retorna la información pública necesaria para mostrar el documento a firmar.
     */
    async getSignatureByToken(token) {
        const [rows] = await pool.execute(`
            SELECT 
                d.id,
                d.nombres_apellidos,
                d.cedula,
                d.empresa,
                d.datos_completos,
                d.estado_firma,
                d.fecha_envio_firma,
                d.firma_base64
            FROM DOTACION_SOLICITUD_PROVEEDOR_DETALLE d
            WHERE d.firma_token = ?
        `, [token]);

        if (rows.length === 0) {
            throw new Error('Enlace de firma inválido o expirado.');
        }

        const detalle = rows[0];
        let itemsRecibidos = [];

        try {
            const parsedData = typeof detalle.datos_completos === 'string'
                ? JSON.parse(detalle.datos_completos)
                : detalle.datos_completos;

            Object.keys(parsedData).forEach(key => {
                const valor = parsedData[key];
                if (
                    key.toUpperCase().includes('CANTIDAD') &&
                    valor &&
                    valor !== '' &&
                    valor !== 0 &&
                    parseInt(valor) > 0
                ) {
                    const nombreItem = key
                        .replace(/CANTIDAD DE /i, '')
                        .replace(/CANTIDAD /i, '')
                        .trim();
                    itemsRecibidos.push({ item: nombreItem, cantidad: valor });
                }
            });
        } catch (e) {
            console.warn('[FIRMA] Error parseando items para token:', token);
        }

        return {
            id: detalle.id,
            nombres_apellidos: detalle.nombres_apellidos,
            cedula: detalle.cedula,
            empresa: detalle.empresa,
            estado_firma: detalle.estado_firma,
            items: itemsRecibidos,
            firma_base64: detalle.firma_base64
        };
    },

    /**
     * Recibe el trazo en base64 del colaborador y lo guarda como firma confirmada.
     */
    async saveSignature(token, firmaBase64) {
        if (!firmaBase64) throw new Error('La firma (trazo) es requerida');

        const [result] = await pool.execute(`
            UPDATE DOTACION_SOLICITUD_PROVEEDOR_DETALLE
            SET estado_firma = 'Firmado', fecha_firma = NOW(), firma_base64 = ?
            WHERE firma_token = ? AND estado_firma = 'Pendiente Firma'
        `, [firmaBase64, token]);

        if (result.affectedRows === 0) {
            throw new Error('Enlace no válido, expirado o el documento ya fue firmado anteriormente.');
        }

        return { success: true };
    }
};

module.exports = DotacionFirmaService;
