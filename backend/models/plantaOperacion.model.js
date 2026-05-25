const pool = require('../config/db');

class PlantaOperacion {
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM planta_operaciones ORDER BY id_planta ASC');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getByUsername(username) {
        try {
            const [rows] = await pool.execute('SELECT * FROM planta_operaciones WHERE usuario_ad = ? LIMIT 1', [username]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        const query = `
            INSERT INTO planta_operaciones (
                empleador, cedula, nombre, cargo, correo_corp, usuario_ad, fecha_ingreso, contrato, tipo_empleado, 
                regional, zona, ciudad, unidad_negocio, cliente, empresa, codigo_ptr, 
                cc_helisa, oficina, vacante_sobrante, planta_aprobada, supervisor_gerente, 
                status, novedad, motivo_retiro, fecha_inicial, fecha_final, fecha_retiro, 
                traslado_oficina_destino, dias_ausencia, observacion, jornada, correo, 
                estado, banco, cuenta_bancaria, tipo_cuenta, usuario_osticket
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            data.empleador || null, 
            data.cedula || null, 
            data.nombre_completo || null, 
            data.cargo || null, 
            data.correo_corp || null,
            data.usuario_ad || null,
            data.fecha_ingreso || null, 
            data.contrato || null, 
            data.tipo_empleado || null,
            data.regional || null, 
            data.zona || null, 
            data.ciudad || null, 
            data.unidad_negocio || null, 
            data.cliente || null, 
            data.empresa || null, 
            data.cod_ptr || null,
            data.cc_helisa || null, 
            data.oficina || null, 
            data.vacante_sob || null, 
            data.planta_aprob || null, 
            data.supervisor_gerente || null,
            data.status || null, 
            data.novedad || null, 
            data.motivo_retiro || null, 
            data.fecha_inicial || null, 
            data.fecha_final || null, 
            data.fecha_retiro || null,
            data.destino_traslado || null, 
            data.dias_ausencia || 0, 
            data.observacion || null, 
            data.jornada || null, 
            data.correo || null,
            data.estado || null, 
            data.banco || null, 
            data.cuenta || null, 
            data.tipo_cuenta || null,
            data.correo_corp || null // usuario_osticket almacena el mismo correo corporativo
        ];

        try {
            const [result] = await pool.execute(query, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        // Obtenemos los campos que vienen en data (filtrando los undefined)
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`\`${key}\` = ?`);
                
                let finalValue = value;
                // Manejar fechas ISO y convertirlas al formato de MySQL
                if (typeof value === 'string' && value.includes('T') && value.endsWith('Z')) {
                    if (key.startsWith('fecha')) {
                        finalValue = value.split('T')[0];
                    } else {
                        // Para DATETIME, convertir a "YYYY-MM-DD HH:MM:SS"
                        finalValue = value.replace('T', ' ').substring(0, 19);
                    }
                }
                
                values.push(finalValue === '' ? null : finalValue);
            }
        }

        if (fields.length === 0) {
            return null; // Nada que actualizar
        }

        const query = `UPDATE planta_operaciones SET ${fields.join(', ')} WHERE id_planta = ?`;
        values.push(id);

        try {
            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getOficinaDetails(oficinaName) {
        const query = `
            SELECT 
                COALESCE(cc.ptr, null) as ptr,
                COALESCE(cc.helisa_cc, null) as helisa_cc,
                r.name as regional,
                z.name as zona,
                c.name as ciudad,
                CONCAT(u.name, ' ', u.last_name) as supervisor
            FROM master_offices o
            LEFT JOIN cost_center cc ON o.office_id = cc.oficina_id
            LEFT JOIN master_regional r ON COALESCE(cc.regional_id, null) = r.regional_id
            LEFT JOIN zona z ON COALESCE(cc.zona_id, null) = z.zona_id
            LEFT JOIN master_cities c ON COALESCE(cc.ciudad_id, o.city_id) = c.city_id
            LEFT JOIN master_leader l ON COALESCE(cc.lider_id, o.leader_id) = l.leader_id
            LEFT JOIN users u ON l.user_id = u.user_id
            WHERE o.name = ?
            LIMIT 1
        `;

        try {
            const [rows] = await pool.execute(query, [oficinaName]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PlantaOperacion;
