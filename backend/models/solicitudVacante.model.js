const pool = require('../config/db');

class SolicitudVacante {
    // Obtener todas las solicitudes (según filtros y rol)
    static async getAll(filters = {}) {
        try {
            let query = `
                SELECT 
                    s.*,
                    CONCAT(u.name, ' ', u.last_name) as solicitante_nombre
                FROM solicitud_vacantes s
                LEFT JOIN users u ON s.solicitante_id = u.user_id
                WHERE 1=1
            `;
            const params = [];

            if (filters.solicitante_id) {
                query += ' AND s.solicitante_id = ?';
                params.push(filters.solicitante_id);
            }

            if (filters.estado) {
                query += ' AND s.estado = ?';
                params.push(filters.estado);
            }

            if (filters.busqueda) {
                query += ' AND (s.codigo_solicitud LIKE ? OR s.cargo LIKE ? OR s.cliente LIKE ?)';
                const searchTerm = `%${filters.busqueda}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY s.created_at DESC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (err) {
            console.error('[SolicitudVacante] Error getting all:', err);
            return [];
        }
    }

    // Obtener por ID
    static async getById(id) {
        try {
            const [rows] = await pool.execute(`
                SELECT s.*, CONCAT(u.name, ' ', u.last_name) as solicitante_nombre
                FROM solicitud_vacantes s
                LEFT JOIN users u ON s.solicitante_id = u.user_id
                WHERE s.id = ?
            `, [id]);
            return rows[0] || null;
        } catch (err) {
            console.error('[SolicitudVacante] Error getting by id:', err);
            return null;
        }
    }

    // Crear solicitud
    static async create(data) {
        try {
            const codigo = await this.generarCodigo();
            const [result] = await pool.execute(`
                INSERT INTO solicitud_vacantes (
                    codigo_solicitud, solicitante_id, empresa, cliente, regional,
                    unidad_negocio, zona, cargo, cantidad, ciudad, oficina,
                    justificacion, detalle, tipo_contrato, salario_presupuestado,
                    estado, hoja_vida_path, aprobacion_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                codigo, 
                data.solicitante_id, 
                data.empresa || null, 
                data.cliente || null, 
                data.regional || null,
                data.unidad_negocio || null, 
                data.zona || null, 
                data.cargo || '', 
                data.cantidad || 1, 
                data.ciudad || null, 
                data.oficina || null, 
                data.justificacion || null, 
                data.detalle || null, 
                data.tipo_contrato || null, 
                data.salario_presupuestado || null, 
                data.estado || 'Borrador',
                data.hoja_vida_path || null, 
                data.aprobacion_path || null
            ]);

            // Registrar en historial
            await this.registrarHistorial(result.insertId, data.solicitante_id, 'CREACION', 'Se creó la solicitud en modo borrador');

            return { id: result.insertId, codigo };
        } catch (err) {
            console.error('[SolicitudVacante] Error creating:', err);
            return null;
        }
    }

    // Actualizar solicitud
    static async update(id, data, userId) {
        try {
            const fields = [];
            const params = [];

            const allowedFields = [
                'empresa', 'cliente', 'regional', 'unidad_negocio', 'zona', 
                'cargo', 'cantidad', 'ciudad', 'oficina', 'justificacion', 
                'detalle', 'tipo_contrato', 'salario_presupuestado', 'estado',
                'hoja_vida_path', 'aprobacion_path'
            ];

            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    params.push(data[field]);
                }
            });

            if (fields.length === 0) return false;

            params.push(id);
            const query = `UPDATE solicitud_vacantes SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await pool.execute(query, params);

            if (result.affectedRows > 0) {
                await this.registrarHistorial(id, userId, 'ACTUALIZACION', 'Se actualizaron los datos de la solicitud');
                return true;
            }
            return false;
        } catch (err) {
            console.error('[SolicitudVacante] Error updating:', err);
            return false;
        }
    }

    // Enviar solicitud (Cambiar estado y opcionalmente crear requisición)
    static async enviar(id, userId) {
        try {
            const [result] = await pool.execute(
                "UPDATE solicitud_vacantes SET estado = 'Enviado' WHERE id = ? AND estado = 'Borrador'",
                [id]
            );

            if (result.affectedRows > 0) {
                await this.registrarHistorial(id, userId, 'ENVIO', 'La solicitud ha sido enviada para revisión');
                return true;
            }
            return false;
        } catch (err) {
            console.error('[SolicitudVacante] Error enviando:', err);
            return false;
        }
    }

    // Registrar en historial
    static async registrarHistorial(solicitudId, userId, accion, observacion) {
        try {
            await pool.execute(`
                INSERT INTO solicitud_vacante_historial (solicitud_id, user_id, accion, observacion)
                VALUES (?, ?, ?, ?)
            `, [solicitudId, userId, accion, observacion]);
        } catch (err) {
            console.error('[SolicitudVacante] Error registering history:', err);
        }
    }

    // Obtener historial
    static async getHistorial(solicitudId) {
        try {
            const [rows] = await pool.execute(`
                SELECT h.*, CONCAT(u.name, ' ', u.last_name) as user_nombre
                FROM solicitud_vacante_historial h
                LEFT JOIN users u ON h.user_id = u.user_id
                WHERE h.solicitud_id = ?
                ORDER BY h.created_at DESC
            `, [solicitudId]);
            return rows;
        } catch (err) {
            console.error('[SolicitudVacante] Error getting history:', err);
            return [];
        }
    }

    // Generar código SOL-AAAA-XXX
    static async generarCodigo() {
        const año = new Date().getFullYear();
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM solicitud_vacantes WHERE YEAR(created_at) = ?`,
            [año]
        );
        const numero = (rows[0].count || 0) + 1;
        return `SOL-${año}-${numero.toString().padStart(3, '0')}`;
    }
}

module.exports = SolicitudVacante;
