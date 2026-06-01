const PlantaOperacion = require('../models/plantaOperacion.model');
const revalService = require('../services/reval.service');
const pool = require('../config/db');
const emailService = require('../services/email.service');
const crypto = require('crypto');

// Utilidad para Encriptación Simétrica (Clave de 32 bytes)
const ENCRYPTION_KEY = process.env.JWT_SECRET ? process.env.JWT_SECRET.padEnd(32, '0').substring(0, 32) : 'talento_humano_secret_key_123456';
const IV_LENGTH = 16;

function encryptText(text) {
    if (!text) return null;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptText(text) {
    if (!text) return null;
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Helper to generate dynamic, secure temporary passwords
const generateTempPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let result = 'Temp';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    for (let i = 0; i < 2; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    result += '!';
    return result;
};

// Helper to remove accents, convert to lowercase, and remove special characters
const cleanText = (text) => {
    if (!text) return '';
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // remove special characters except spaces
        .trim();
};

// Generates corporate email format: primer_nombre.primer_apellido@domain
const generateCorporateEmail = (empresa, primerNombre, primerApellido, nombreCompleto = '') => {
    if (!empresa) return '';
    let pNombre = cleanText(primerNombre);
    let pApellido = cleanText(primerApellido);

    if (!pNombre || !pApellido) {
        if (!nombreCompleto) return '';
        const cleaned = cleanText(nombreCompleto);
        const parts = cleaned.split(/\s+/);
        if (parts.length > 0 && parts[0] !== '') {
            pNombre = parts[0];
            if (parts.length === 2) {
                pApellido = parts[1];
            } else if (parts.length === 3) {
                pApellido = parts[1]; // typical Juan Perez Gomez -> Perez
            } else if (parts.length >= 4) {
                pApellido = parts[2]; // typical Juan Carlos Perez Gomez -> Perez
            }
        }
    }

    if (!pNombre || !pApellido) return '';

    const domain = empresa.toUpperCase() === 'REVAL' ? 'reval.com.co' : 'multipagas.com';
    return `${pNombre}.${pApellido}@${domain}`;
};

const sendCredentialsEmail = async (personalEmail, nombreCompleto, correoCorp, usuarioAd, adPass, emailPass, osticketPass) => {
    if (!personalEmail) {
        console.error('Error auto-enviando credenciales: Colaborador no tiene correo personal.');
        return false;
    }

    const showAd = !!adPass;
    const showEmail = !!emailPass && !!correoCorp;
    const showOsticket = !!osticketPass;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
            <h2 style="color: #2A2A54;">Hola, ${nombreCompleto}</h2>
            <p>Tus credenciales de acceso a los sistemas corporativos han sido generadas exitosamente y se envían de forma automática por directriz de seguridad:</p>
            
            ${showAd ? `
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4A90E2; margin: 15px 0; border-radius: 4px;">
                <h3 style="color: #4A90E2; margin-top: 0; margin-bottom: 8px;">💻 Directorio Activo (PC / Red)</h3>
                <p style="margin: 4px 0;"><strong>Usuario:</strong> ${usuarioAd}</p>
                <p style="margin: 4px 0;"><strong>Contraseña Temporal:</strong> ${adPass}</p>
            </div>
            ` : ''}

            ${showEmail ? `
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2ECC71; margin: 15px 0; border-radius: 4px;">
                <h3 style="color: #2ECC71; margin-top: 0; margin-bottom: 8px;">📧 Correo Corporativo</h3>
                <p style="margin: 4px 0;"><strong>Correo:</strong> ${correoCorp}</p>
                <p style="margin: 4px 0;"><strong>Contraseña Temporal:</strong> ${emailPass}</p>
            </div>
            ` : ''}

            ${showOsticket ? `
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #FFCD04; margin: 15px 0; border-radius: 4px;">
                <h3 style="color: #FFCD04; margin-top: 0; margin-bottom: 8px;">🎫 Portal de Soporte (SAHG / osTicket)</h3>
                <p style="margin: 4px 0;"><strong>Usuario (Correo):</strong> ${correoCorp || usuarioAd + '@reval.com.co'}</p>
                <p style="margin: 4px 0;"><strong>Contraseña Temporal:</strong> ${osticketPass}</p>
            </div>
            ` : ''}

            <p style="color: #666; font-size: 0.9em; margin-top: 20px;">Por seguridad, por favor cambia tus contraseñas temporales al iniciar sesión por primera vez.</p>
            <p>Atentamente,<br><strong>Equipo NEXUS 360</strong></p>
        </div>
    `;

    const result = await emailService.sendMail({
        to: personalEmail,
        subject: '🔐 Credenciales de Acceso - Sistemas Corporativos',
        html: htmlContent
    });

    if (result.success) {
        console.log(`✅ Credenciales auto-enviadas exitosamente al correo personal ${personalEmail}`);
        return true;
    } else {
        console.error('[EMAIL_SERVICE] Error de auto-envío de credenciales:', result.error);
        return false;
    }
};

const getAllPlantaOperaciones = async (req, res) => {
    try {
        const data = await PlantaOperacion.getAll();
        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error('Error in getAllPlantaOperaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los datos de la planta de operación',
            error: error.message
        });
    }
};

const createPlantaOperacion = async (req, res) => {
    try {
        console.log('🔥 CONTROLADOR CORRECTO EJECUTADO');

        const {
            usuario_ad,
            nombre_completo,
            cedula,
            requiere_correo,
            empresa,
            correo_corp,
            primer_nombre: req_primer_nombre,
            segundo_nombre: req_segundo_nombre,
            primer_apellido: req_primer_apellido
        } = req.body;

        // Generar correo corporativo si requiere correo y no viene pre-calculado
        if (requiere_correo === 'si' && !req.body.correo_corp) {
            req.body.correo_corp = generateCorporateEmail(empresa, req_primer_nombre, req_primer_apellido, nombre_completo);
        }

        // Generar / Normalizar usuario AD base
        let base_username = req.body.usuario_ad;
        let pNombreClean = cleanText(req_primer_nombre || nombre_completo?.split(/\s+/)[0]);
        let sNombreClean = cleanText(req_segundo_nombre || nombre_completo?.split(/\s+/)[1]);
        let pApellidoClean = cleanText(req_primer_apellido || nombre_completo?.split(/\s+/)[2] || nombre_completo?.split(/\s+/)[1]);

        if (!base_username) {
            if (pNombreClean && pApellidoClean) {
                const initial1 = pNombreClean.charAt(0);
                const initial2 = sNombreClean ? sNombreClean.charAt(0) : '';
                base_username = `${initial1}${initial2}${pApellidoClean}`.toLowerCase();
            } else {
                base_username = cedula.toLowerCase(); // fallback
            }
        } else {
            base_username = base_username.toLowerCase();
        }

        // Resolver colisiones contra la base de datos
        let final_username = base_username;
        try {
            const existing = await PlantaOperacion.getByUsername(final_username);
            if (existing) {
                console.log(`⚠️ Colisión de usuario detectada para: ${final_username}`);
                if (pNombreClean && pApellidoClean) {
                    const initial1 = pNombreClean.charAt(0);
                    const initial2 = sNombreClean ? sNombreClean.charAt(0) : '';
                    final_username = `${initial1}${initial1}${initial2}${pApellidoClean}`.toLowerCase();
                    console.log(`🔄 Colisión resuelta. Nuevo usuario generado: ${final_username}`);
                }
            }
        } catch (dbErr) {
            console.error('[COLLISION_CHECK] Error consultando la base de datos:', dbErr.message);
        }

        req.body.usuario_ad = final_username;
        req.body.usuario_osticket = req.body.correo_corp || null;

        // 1. Guardar en la base de datos local
        const result = await PlantaOperacion.create(req.body);

        // 2. Preparar datos para REVAL
        let primer_nombre = cleanText(req_primer_nombre);
        let primer_apellido = cleanText(req_primer_apellido);

        if (!primer_nombre || !primer_apellido) {
            const cleaned = cleanText(nombre_completo);
            const parts = cleaned.split(/\s+/);
            if (!primer_nombre) primer_nombre = parts[0] || 'Usuario';
            if (!primer_apellido) {
                if (parts.length === 2) {
                    primer_apellido = parts[1];
                } else if (parts.length === 3) {
                    primer_apellido = parts[1];
                } else if (parts.length >= 4) {
                    primer_apellido = parts[2];
                } else {
                    primer_apellido = 'AD';
                }
            }
        }

        revalResult = { success: false };
        const adPassword = generateTempPassword();

        // 3. Consumir API de Directorio Activo (Puerto 8000)
        let revalUserData = {
            username: req.body.usuario_ad,
            firstname: primer_nombre.toUpperCase(),
            lastname: primer_apellido.toUpperCase(),
            password: adPassword,
            ou_path: 'OU=Usuarios,OU=Sac,DC=reval,DC=local',
            groups: ['SG_PTR_PLUS_PRODUCCION']
        };

        console.log('📤 [PASO 1] Enviando a REVAL AD API (Puerto 8000):', revalUserData);
        try {
            revalResult = await revalService.createRevalUser(revalUserData);
            console.log('📥 [PASO 1] Respuesta de REVAL AD API:', revalResult);
        } catch (err) {
            console.error('[REVAL] Error en integración paso 1 (Puerto 8000):', err.message);
            revalResult = { success: false, error: err.message };
        }

        // --- MANEJO DE COLISIONES EN TIEMPO DE EJECUCIÓN (ACTIVE DIRECTORY) ---
        const errorDetail = revalResult.error?.detail || (typeof revalResult.error === 'string' ? revalResult.error : '');
        const errorStr = revalResult.error ? JSON.stringify(revalResult.error) : '';
        const isCollision = (typeof errorDetail === 'string' && errorDetail.includes('entryAlreadyExists')) ||
            (typeof errorStr === 'string' && errorStr.includes('entryAlreadyExists'));

        if (revalResult.success === false && isCollision) {
            console.log(`⚠️ Colisión remota en AD detectada para: ${revalUserData.username}. Intentando resolución de colisión...`);
            if (pNombreClean && pApellidoClean) {
                const initial1 = pNombreClean.charAt(0);
                const initial2 = sNombreClean ? sNombreClean.charAt(0) : '';
                const final_username = `${initial1}${initial1}${initial2}${pApellidoClean}`.toLowerCase();

                console.log(`🔄 Re-generando usuario AD a: ${final_username} para re-intento`);
                req.body.usuario_ad = final_username;
                revalUserData.username = final_username;

                // 1. Actualizar en la base de datos local
                try {
                    const pool = require('../config/db');
                    await pool.execute('UPDATE planta_operaciones SET usuario_ad = ? WHERE id_planta = ?', [final_username, result.insertId]);
                    console.log(`✅ Base de datos local actualizada con el nuevo username: ${final_username}`);
                } catch (dbUpdErr) {
                    console.error('[COLLISION_RETRY] Error actualizando BD local:', dbUpdErr.message);
                }

                // 2. Re-intentar la creación en el Directorio Activo (Puerto 8000)
                console.log('📤 [RE-INTENTO PASO 1] Enviando a REVAL AD API (Puerto 8000):', revalUserData);
                try {
                    revalResult = await revalService.createRevalUser(revalUserData);
                    console.log('📥 [RE-INTENTO PASO 1] Respuesta de REVAL AD API:', revalResult);
                } catch (err) {
                    console.error('[REVAL] Error en re-intento paso 1 (Puerto 8000):', err.message);
                    revalResult = { success: false, error: err.message };
                }
            }
        }

        // 4. Si requiere correo corporativo Y la creación en el paso 1 fue exitosa (Puerto 8003)
        if (requiere_correo === 'si' && revalResult && revalResult.success !== false) {
            const emailAddress = req.body.correo_corp || `${primer_nombre}.${primer_apellido}@reval.com.co`;

            const revalEmailData = {
                email: emailAddress,
                nombre: primer_nombre.toUpperCase(),
                apellido: primer_apellido.toUpperCase()
            };

            console.log('📤 [PASO 2] Enviando a REVAL EMAIL API (Puerto 8003):', revalEmailData);
            try {
                const emailResult = await revalService.createRevalEmailUser(revalEmailData);
                console.log('📥 [PASO 2] Respuesta de REVAL EMAIL API:', emailResult);
                revalResult.emailResult = emailResult;
                if (emailResult && emailResult.success !== false) {
                    const emailPassToSave = emailResult.temporary_password || emailResult.password || emailResult.temp_password || 'Mail123!';
                    revalResult.emailResult.temporary_password = emailPassToSave;
                }
            } catch (err) {
                console.error('[REVAL_EMAIL] Error en integración paso 2 (Puerto 8003):', err.message);
                revalResult.emailResult = { success: false, error: err.message };
            }
        }

        // PASO 3: Crear usuario en osTicket (Puerto 8001) - siempre tras éxito del PASO 1
        let osticketResult = null;
        if (revalResult && revalResult.success !== false) {
            const emailForOsticket = req.body.correo_corp || `${primer_nombre}.${primer_apellido}@reval.com.co`;
            const osticketData = {
                username: emailForOsticket, // El usuario de osTicket/SAHG es el correo corporativo
                email: emailForOsticket,
                name: `${primer_nombre} ${primer_apellido}`.toUpperCase()
            };

            console.log('📤 [PASO 3] Enviando a osTicket API (Puerto 8001):', osticketData);
            try {
                osticketResult = await revalService.createOsticketUser(osticketData);
                console.log('📥 [PASO 3] Respuesta de osTicket API:', osticketResult);
                if (osticketResult?.temporary_password) {
                    console.log(`🔐 [OSTICKET] Contraseña temporal generada para ${osticketData.username}: ${osticketResult.temporary_password}`);
                }
            } catch (err) {
                console.error('[OSTICKET] Error en integración paso 3 (Puerto 8001):', err.message);
                osticketResult = { success: false, error: err.message };
            }
        }

        // Estructurar objeto de credenciales completas para el modal de frontend (sin contraseñas por seguridad)
        const responseCredentials = {
            ad: {
                username: req.body.usuario_ad,
                success: revalResult && revalResult.success !== false
            },
            email: {
                email: requiere_correo === 'si' ? (req.body.correo_corp || `${primer_nombre}.${primer_apellido}@reval.com.co`) : null,
                success: requiere_correo === 'si' ? (revalResult?.emailResult && revalResult.emailResult.success !== false) : false
            },
            osticket: {
                // El identificador de login en osTicket/SAHG es el correo corporativo
                email: requiere_correo === 'si'
                    ? (req.body.correo_corp || `${primer_nombre}.${primer_apellido}@reval.com.co`)
                    : `${primer_nombre}.${primer_apellido}@reval.com.co`,
                success: !!osticketResult?.temporary_password
            }
        };

        // Auto-enviar credenciales al correo personal de forma automática
        const finalAdPass = (revalResult && revalResult.success !== false) ? adPassword : null;
        const finalEmailPass = (requiere_correo === 'si' && revalResult?.emailResult && revalResult.emailResult.success !== false) ? (revalResult.emailResult.temporary_password || 'Mail123!') : null;
        const finalOsticketPass = osticketResult?.temporary_password || null;

        if (req.body.correo) {
            await sendCredentialsEmail(
                req.body.correo,
                req.body.nombre_completo || (req_primer_nombre + ' ' + req_primer_apellido),
                req.body.correo_corp || (requiere_correo === 'si' ? `${primer_nombre}.${primer_apellido}@reval.com.co` : null),
                req.body.usuario_ad,
                finalAdPass,
                finalEmailPass,
                finalOsticketPass
            );
        }

        res.status(201).json({
            success: true,
            message: 'Colaborador registrado exitosamente',
            id: result.insertId,
            credentials: responseCredentials,
            reval: revalResult,
            osticket: osticketResult
        });
    } catch (error) {
        console.error('Error in createPlantaOperacion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar: ' + error.message,
            error: error.message
        });
    }
};

const updatePlantaOperacion = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Evitamos actualizar el ID o campos de auditoría por ahora
        delete data.id_planta;
        delete data.created_at;
        delete data.updated_at;

        const result = await PlantaOperacion.update(id, data);

        if (!result) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos para actualizar'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Registro actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error in updatePlantaOperacion:', error);
        require('fs').appendFileSync('error_log.txt', 'UPDATE ERROR:\n' + error.stack + '\n\n');
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el registro',
            error: error.message
        });
    }
};

const getOficinaDetails = async (req, res) => {
    try {
        const { oficinaName } = req.params;
        const details = await PlantaOperacion.getOficinaDetails(oficinaName);

        if (!details) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron detalles para la oficina especificada'
            });
        }

        res.json({
            success: true,
            data: details
        });
    } catch (error) {
        console.error('Error in getOficinaDetails:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los detalles de la oficina',
            error: error.message
        });
    }
};

const enviarCredencialesSahg = async (req, res) => {
    try {
        const { id } = req.params;
        const { via, selected } = req.body; // 'correo' o 'celular', y selección opcional

        // 1. Obtener la data del usuario
        const [rows] = await pool.query('SELECT nombre, usuario_ad, correo, correo_corp, clave_ad, clave_correo, clave_osticket FROM planta_operaciones WHERE id_planta = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        const user = rows[0];

        // 2. Desencriptar contraseñas si existen
        let adPassDecrypted = null;
        let emailPassDecrypted = null;
        let osticketPassDecrypted = null;

        try {
            if (user.clave_ad) adPassDecrypted = decryptText(user.clave_ad);
            if (user.clave_correo) emailPassDecrypted = decryptText(user.clave_correo);
            if (user.clave_osticket) osticketPassDecrypted = decryptText(user.clave_osticket);
        } catch (e) {
            console.error('Error desencriptando las claves:', e);
            return res.status(500).json({ success: false, message: 'Error interno al procesar las contraseñas de seguridad.' });
        }

        // Filtro de selección (si viene de frontend, de lo contrario todo lo que tenga clave)
        const showAd = selected ? (selected.ad && adPassDecrypted) : !!adPassDecrypted;
        const showEmail = selected ? (selected.email && emailPassDecrypted) : !!emailPassDecrypted;
        const showOsticket = selected ? (selected.osticket && osticketPassDecrypted) : !!osticketPassDecrypted;

        if (!showAd && !showEmail && !showOsticket) {
            return res.status(400).json({ success: false, message: 'No hay ninguna credencial seleccionada o configurada para enviar.' });
        }

        // 3. Enviar según el medio
        if (via === 'correo') {
            if (!user.correo) return res.status(400).json({ success: false, message: 'El colaborador no tiene un correo personal registrado para recibir las notificaciones.' });

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #2A2A54;">Hola, ${user.nombre}</h2>
                    <p>Tus credenciales de acceso a los sistemas corporativos han sido generadas exitosamente:</p>
                    
                    ${showAd ? `
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4A90E2; margin: 15px 0; border-radius: 4px;">
                        <h3 style="color: #4A90E2; margin-top: 0; margin-bottom: 8px;">💻 Directorio Activo (PC / Red)</h3>
                        <p style="margin: 4px 0;"><strong>Usuario:</strong> ${user.usuario_ad}</p>
                        <p style="margin: 4px 0;"><strong>Contraseña Temporal:</strong> ${adPassDecrypted}</p>
                    </div>
                    ` : ''}

                    ${showEmail && user.correo_corp ? `
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2ECC71; margin: 15px 0; border-radius: 4px;">
                        <h3 style="color: #2ECC71; margin-top: 0; margin-bottom: 8px;">📧 Correo Corporativo</h3>
                        <p style="margin: 4px 0;"><strong>Correo:</strong> ${user.correo_corp}</p>
                        <p style="margin: 4px 0;"><strong>Contraseña Temporal:</strong> ${emailPassDecrypted}</p>
                    </div>
                    ` : ''}

                    ${showOsticket ? `
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #FFCD04; margin: 15px 0; border-radius: 4px;">
                        <h3 style="color: #FFCD04; margin-top: 0; margin-bottom: 8px;">🎫 Portal de Soporte (SAHG / osTicket)</h3>
                        <p style="margin: 4px 0;"><strong>Usuario (Correo):</strong> ${user.correo_corp || user.usuario_ad + '@reval.com.co'}</p>
                        <p style="margin: 4px 0;"><strong>Contraseña Temporal:</strong> ${osticketPassDecrypted}</p>
                    </div>
                    ` : ''}

                    <p style="color: #666; font-size: 0.9em; margin-top: 20px;">Por seguridad, por favor cambia tus contraseñas temporales al iniciar sesión por primera vez.</p>
                    <p>Atentamente,<br><strong>Equipo NEXUS 360</strong></p>
                </div>
            `;

            const result = await emailService.sendMail({
                to: user.correo,
                subject: '🔐 Credenciales de Acceso - Sistemas Corporativos',
                html: htmlContent
            });

            if (result.success) {
                return res.status(200).json({ success: true, message: 'Credenciales enviadas al correo registrado.' });
            } else {
                console.error('[EMAIL_SERVICE] Error de envío:', result.error);
                if (result.error.includes('535-5.7.8')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Google bloqueó el envío por seguridad. Debes generar una "Contraseña de Aplicación" en tu cuenta de Gmail.'
                    });
                }
                return res.status(502).json({ success: false, message: 'Fallo al conectar con el servidor de correo: ' + result.error });
            }

        } else if (via === 'celular') {
            if (!user.celular) return res.status(400).json({ success: false, message: 'El usuario no tiene un número de celular asignado.' });

            // Aquí iría la integración con SMS o WhatsApp si es necesario.
            console.log(`[SMS MOCK] Enviando credenciales a celular ${user.celular}: Usuario ${user.usuario_ad}`);
            return res.status(200).json({ success: true, message: 'Credenciales enviadas vía celular (Simulado).' });
        } else {
            return res.status(400).json({ success: false, message: 'Método de envío no válido. Use "correo" o "celular".' });
        }

    } catch (error) {
        console.error('Error in enviarCredencialesSahg:', error);
        res.status(500).json({ success: false, message: 'Error al enviar credenciales', error: error.message });
    }
};

const getRetirados = async (req, res) => {
    try {
        const data = await PlantaOperacion.getRetirados();
        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error('Error in getRetirados:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los datos de la base inactiva',
            error: error.message
        });
    }
};

const transferirYLimpiar = async (req, res) => {
    try {
        const { id } = req.params;
        await PlantaOperacion.transferirYLimpiar(id);
        res.json({
            success: true,
            message: 'Empleado transferido a Retiros y datos personales limpiados exitosamente'
        });
    } catch (error) {
        console.error('Error in transferirYLimpiar:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al transferir y limpiar los datos',
            error: error.message
        });
    }
};

const transferirYEliminar = async (req, res) => {
    try {
        const { id } = req.params;
        await PlantaOperacion.transferirYEliminar(id);
        res.json({
            success: true,
            message: 'Empleado transferido a Retiros y registro eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error in transferirYEliminar:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al transferir y eliminar el registro',
            error: error.message
        });
    }
};

module.exports = {
    getAllPlantaOperaciones,
    createPlantaOperacion,
    updatePlantaOperacion,
    getOficinaDetails,
    enviarCredencialesSahg,
    getRetirados,
    transferirYLimpiar,
    transferirYEliminar
};

