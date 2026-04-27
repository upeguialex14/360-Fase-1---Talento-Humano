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
                    u.full_name as analista_asignado_nombre,
                    s.full_name as solicitante_nombre,
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
                    u.full_name as analista_asignado_nombre
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
            // Generar código único
            const codigo = await this.generarCodigo();
            
            const [result] = await pool.execute(`
                INSERT INTO requisiciones (
                    codigo_req, fecha_llegada, mes, empresa, cliente, regional,
                    unidad_negocio, zona, cargo, cantidad, justificacion, detalle,
                    tipo_contrato, estado, oficina, ciudad, hoja_vida_path, aprobacion_path,
                    solicitante_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                codigo,
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
                `SELECT COUNT(*) as total FROM requisiciones ${whereClause}`,
                params
            );
            
            // Por estado
            const [porEstado] = await pool.execute(
                `SELECT estado, COUNT(*) as cantidad FROM requisiciones ${whereClause} GROUP BY estado`,
                params
            );
            
            // Promedio de días de mora
            const [mora] = await pool.execute(
                `SELECT AVG(dias_mora) as promedio FROM requisiciones ${whereClause} AND dias_mora > 0`,
                params
            );
            
            // Total recursos solicitados
            const [recursos] = await pool.execute(
                `SELECT SUM(cantidad) as total FROM requisiciones ${whereClause}`,
                params
            );
            
            // Cumplimiento promedio
            const [cumplimiento] = await pool.execute(
                `SELECT AVG(porcentaje_cumplimiento) as promedio FROM requisiciones ${whereClause}`,
                params
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
    
    // Obtener analistas disponibles
    static async getAnalistas() {
        try {
            const [rows] = await pool.execute(`
                SELECT user_id, full_name, email 
                FROM users 
                WHERE role_code = 'ANALISTA' AND is_active = 1
                ORDER BY full_name ASC
            `);
            return rows;
        } catch (err) {
            console.error('[Requisicion] Error getting analistas:', err);
            return [];
        }
    }
}

module.exports = Requisicion;