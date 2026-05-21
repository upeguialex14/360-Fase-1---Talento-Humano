const pool = require('../config/db');

class Requisicion {
    // Obtener todas las requisiciones (con filtros según rol)
    static async getAll(filters = {}) {
        try {
            let query = `
                SELECT 
                    r.id,
                    r.codigo_req,
                    r.fecha_llegada,
                    r.mes,
                    r.empresa,
                    r.cliente,
                    r.regional,
                    r.unidad_negocio,
                    r.zona,
                    r.cargo,
                    r.cantidad,
                    r.ciudad,
                    r.oficina,
                    r.justificacion,
                    r.detalle,
                    r.tipo_contrato,
                    r.estado,
                    r.asignado_a,
                    r.analista_asignado_id,
                    r.analista_asignado_id,
                    CONCAT(u.name, ' ', u.last_name) as analista_asignado_nombre,
                    CONCAT(s.name, ' ', s.last_name) as solicitante_nombre,
                    r.created_at,
                    r.updated_at,
                    r.hoja_vida_path,
                    r.aprobacion_path
                FROM requisiciones r
                LEFT JOIN users u ON r.analista_asignado_id = u.user_id
                LEFT JOIN users s ON r.solicitante_id = s.user_id
                WHERE 1=1
            `;
            
            const params = [];
            
            // Filtros
            if (filters.analista_id) {
                query += ' AND r.analista_asignado_id = ?';
                params.push(filters.analista_id);
            }
            
            if (filters.estado) {
                query += ' AND r.estado = ?';
                params.push(filters.estado);
            }
            
            if (filters.busqueda) {
                query += ' AND (r.codigo_req LIKE ? OR r.cargo LIKE ? OR r.cliente LIKE ? OR r.empresa LIKE ? OR r.regional LIKE ?)';
                const searchTerm = `%${filters.busqueda}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            query += ' ORDER BY r.fecha_llegada DESC, r.id DESC';
            
            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (err) {
            console.error('[Requisicion] Error getting all requisiciones:', err);
            return [];
        }
    }
    
    // Obtener requisición por ID
    static async getById(id) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    r.*,
                    CONCAT(u.name, ' ', u.last_name) as analista_asignado_nombre
                FROM requisiciones r
                LEFT JOIN users u ON r.analista_asignado_id = u.user_id
                WHERE r.id = ?
            `, [id]);
            return rows[0] || null;
        } catch (err) {
            console.error('[Requisicion] Error getting requisicion by id:', err);
            return null;
        }
    }
    
    // Crear requisición desde Solicitud de Vacantes
    static async create(data) {
        try {
            let codigo;

            // Si viene de una solicitud, heredamos su código (cambiando SOL- por REQ-)
            if (data.solicitud_id) {
                const [solRows] = await pool.execute(
                    'SELECT codigo_solicitud FROM solicitud_vacantes WHERE id = ?',
                    [data.solicitud_id]
                );
                if (solRows.length > 0 && solRows[0].codigo_solicitud) {
                    codigo = solRows[0].codigo_solicitud.replace('SOL-', 'REQ-');
                } else {
                    codigo = await this.generarCodigo();
                }
            } else {
                codigo = await this.generarCodigo();
            }
            
            const [result] = await pool.execute(`
                INSERT INTO requisiciones (
                    codigo_req, solicitud_id, fecha_llegada, mes, empresa, cliente, regional,
                    unidad_negocio, zona, cargo, cantidad, justificacion, detalle,
                    tipo_contrato, estado, oficina, ciudad, hoja_vida_path, aprobacion_path,
                    solicitante_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                codigo,
                data.solicitud_id || null,
                data.fecha_llegada || new Date(),
                data.mes || this.getMesActual(),
                data.empresa || 'MULTIVAL',
                data.cliente || '',
                data.regional || '',
                data.unidad_negocio || '',
                data.zona || '',
                data.cargo,
                data.cantidad,
                data.justificacion,
                data.detalle,
                data.tipo_contrato || null,
                'Recibido',
                data.oficina,
                data.ciudad,
                data.hoja_vida_path || null,
                data.aprobacion_path || null,
                data.solicitante_id
            ]);
            
            // Registrar historial inicial
            await this.registrarHistorial(result.insertId, data.solicitante_id, 'RECEPCION', null, 'Recibido', 'Requisición recibida desde Solicitud de Vacantes');

            return result.insertId;
        } catch (err) {
            console.error('[Requisicion] Error creating requisicion:', err);
            return null;
        }
    }
    
    // Actualizar requisición
    static async update(id, data) {
        try {
            const fields = [];
            const params = [];
            
            if (data.tipo_contrato !== undefined) {
                fields.push('tipo_contrato = ?');
                params.push(data.tipo_contrato);
            }
            if (data.estado !== undefined) {
                fields.push('estado = ?');
                params.push(data.estado);
            }
            if (data.analista_asignado_id !== undefined) {
                fields.push('analista_asignado_id = ?');
                params.push(data.analista_asignado_id);
            }
            if (data.unidad_negocio !== undefined) {
                fields.push('unidad_negocio = ?');
                params.push(data.unidad_negocio);
            }
            if (data.zona !== undefined) {
                fields.push('zona = ?');
                params.push(data.zona);
            }
            if (data.regional !== undefined) {
                fields.push('regional = ?');
                params.push(data.regional);
            }
            if (data.cliente !== undefined) {
                fields.push('cliente = ?');
                params.push(data.cliente);
            }
            if (data.empresa !== undefined) {
                fields.push('empresa = ?');
                params.push(data.empresa);
            }
            
            if (fields.length === 0) return false;
            
            fields.push('updated_at = NOW()');
            params.push(id);
            
            const query = `UPDATE requisiciones SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await pool.execute(query, params);
            
            return result.affectedRows > 0;
        } catch (err) {
            console.error('[Requisicion] Error updating requisicion:', err);
            return false;
        }
    }
    
    // Eliminar requisición
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM requisiciones WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('[Requisicion] Error deleting requisicion:', err);
            return false;
        }
    }
    
    // Obtener estadísticas para dashboard
    static async getEstadisticas(analista_id = null) {
        try {
            let whereClause = '';
            const params = [];
            
            if (analista_id) {
                whereClause = 'WHERE analista_asignado_id = ?';
                params.push(analista_id);
            }
            
            // Total requisiciones
            const [total] = await pool.execute(
                `SELECT COUNT(*) as total FROM requisiciones WHERE 1=1 ${analista_id ? 'AND analista_asignado_id = ?' : ''}`,
                analista_id ? [analista_id] : []
            );
            
            // Por estado
            const [porEstado] = await pool.execute(
                `SELECT estado, COUNT(*) as cantidad FROM requisiciones WHERE 1=1 ${analista_id ? 'AND analista_asignado_id = ?' : ''} GROUP BY estado`,
                analista_id ? [analista_id] : []
            );
            
            // Promedio de días de mora
            const [mora] = await pool.execute(
                `SELECT AVG(dias_mora) as promedio FROM requisiciones WHERE 1=1 ${analista_id ? 'AND analista_asignado_id = ?' : ''} AND dias_mora > 0`,
                analista_id ? [analista_id] : []
            );
            
            // Total recursos solicitados
            const [recursos] = await pool.execute(
                `SELECT SUM(cantidad) as total FROM requisiciones WHERE 1=1 ${analista_id ? 'AND analista_asignado_id = ?' : ''}`,
                analista_id ? [analista_id] : []
            );
            
            // Cumplimiento promedio
            const [cumplimiento] = await pool.execute(
                `SELECT AVG(porcentaje_cumplimiento) as promedio FROM requisiciones WHERE 1=1 ${analista_id ? 'AND analista_asignado_id = ?' : ''}`,
                analista_id ? [analista_id] : []
            );
            
            return {
                total: total[0].total || 0,
                porEstado: porEstado.reduce((acc, item) => {
                    acc[item.estado] = item.cantidad;
                    return acc;
                }, {}),
                moraPromedio: mora[0].promedio || 0,
                totalRecursos: recursos[0].total || 0,
                cumplimientoPromedio: cumplimiento[0].promedio || 100
            };
        } catch (err) {
            console.error('[Requisicion] Error getting estadisticas:', err);
            return {
                total: 0,
                porEstado: {},
                moraPromedio: 0,
                totalRecursos: 0,
                cumplimientoPromedio: 100
            };
        }
    }
    
    // Generar código único REQ-AAAA-XXX
    static async generarCodigo() {
        const año = new Date().getFullYear();
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM requisiciones WHERE YEAR(fecha_llegada) = ?`,
            [año]
        );
        const numero = (rows[0].count || 0) + 1;
        return `REQ-${año}-${numero.toString().padStart(3, '0')}`;
    }
    
    // Obtener mes actual en español
    static getMesActual() {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[new Date().getMonth()];
    }
    
    // --- Métodos de Historial y Trazabilidad ---

    static async registrarHistorial(requisicionId, userId, accion, estadoAnterior, estadoNuevo, observacion) {
        try {
            await pool.execute(`
                INSERT INTO requisicion_historial (requisicion_id, user_id, accion, estado_anterior, estado_nuevo, observacion)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [requisicionId, userId, accion, estadoAnterior, estadoNuevo, observacion]);
        } catch (err) {
            console.error('[Requisicion] Error registering history:', err);
        }
    }

    static async getHistorial(requisicionId) {
        try {
            const [rows] = await pool.execute(`
                SELECT h.*, CONCAT(u.name, ' ', u.last_name) as user_nombre
                FROM requisicion_historial h
                LEFT JOIN users u ON h.user_id = u.user_id
                WHERE h.requisicion_id = ?
                ORDER BY h.created_at DESC
            `, [requisicionId]);
            return rows;
        } catch (err) {
            console.error('[Requisicion] Error getting history:', err);
            return [];
        }
    }

    // --- Métodos de Candidatos ---

    static async addCandidato(data) {
        try {
            console.log('[Requisicion] Adding candidate with data:', data);
            const [result] = await pool.execute(`
                INSERT INTO requisicion_candidatos (
                    requisicion_id, nombre_candidato, cedula, telefono, correo, 
                    estado, hoja_vida_path, resultado_entrevista
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.requisicion_id, 
                data.nombre_candidato, 
                data.cedula, 
                data.telefono, 
                data.correo, 
                data.estado || data.estado_proceso || 'Postulado', 
                data.hoja_vida_path || null, 
                data.resultado_entrevista || null
            ]);
            return result.insertId;
        } catch (err) {
            console.error('[Requisicion] Error adding candidate:', err);
            throw err; // Re-throw to be caught by controller
        }
    }

    static async getCandidatos(requisicionId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM requisicion_candidatos WHERE requisicion_id = ? ORDER BY created_at DESC',
                [requisicionId]
            );
            return rows;
        } catch (err) {
            console.error('[Requisicion] Error getting candidates:', err);
            return [];
        }
    }

    // Obtener analistas disponibles
    static async getAnalistas() {
        try {
            const [rows] = await pool.execute(`
                SELECT user_id, CONCAT(name, ' ', last_name) as full_name, email 
                FROM users 
                WHERE role_id = 5 AND is_active = 1
                ORDER BY name ASC
            `);
            return rows;
        } catch (err) {
            console.error('[Requisicion] Error getting analistas:', err);
            return [];
        }
    }
}

module.exports = Requisicion;