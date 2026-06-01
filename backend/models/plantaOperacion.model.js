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

    static async getById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM planta_operaciones WHERE id_planta = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async transferirYEliminar(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Obtener la fila actual de planta_operaciones
            const [rows] = await connection.execute('SELECT * FROM planta_operaciones WHERE id_planta = ?', [id]);
            if (rows.length === 0) {
                throw new Error('Registro no encontrado en Planta de Operación');
            }
            const row = rows[0];

            if (!row.cedula && !row.nombre) {
                throw new Error('Este registro no tiene un empleado asignado para transferir');
            }

            // Si fecha_retiro no está establecida, usamos el día de hoy
            const fechaRetiro = row.fecha_retiro || new Date().toISOString().split('T')[0];

            // 2. Insertar/Actualizar en retirados
            const insertQuery = `
                INSERT INTO retirados (
                    empleador, cedula, nombre, cargo, fecha_ingreso, contrato, tipo_empleado,
                    regional, zona, ciudad, unidad_negocio, cliente, empresa, codigo_ptr,
                    cc_helisa, oficina, vacante_sobrante, planta_aprobada, supervisor_gerente,
                    status, novedad, motivo_retiro, fecha_inicial, fecha_final, fecha_retiro,
                    traslado_oficina_destino, dias_ausencia, observacion, jornada, correo,
                    estado, banco, cuenta_bancaria, tipo_cuenta
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    empleador = VALUES(empleador),
                    nombre = VALUES(nombre),
                    cargo = VALUES(cargo),
                    fecha_ingreso = VALUES(fecha_ingreso),
                    contrato = VALUES(contrato),
                    tipo_empleado = VALUES(tipo_empleado),
                    regional = VALUES(regional),
                    zona = VALUES(zona),
                    ciudad = VALUES(ciudad),
                    unidad_negocio = VALUES(unidad_negocio),
                    cliente = VALUES(cliente),
                    empresa = VALUES(empresa),
                    codigo_ptr = VALUES(codigo_ptr),
                    cc_helisa = VALUES(cc_helisa),
                    oficina = VALUES(oficina),
                    vacante_sobrante = VALUES(vacante_sobrante),
                    planta_aprobada = VALUES(planta_aprobada),
                    supervisor_gerente = VALUES(supervisor_gerente),
                    status = VALUES(status),
                    novedad = VALUES(novedad),
                    motivo_retiro = VALUES(motivo_retiro),
                    fecha_inicial = VALUES(fecha_inicial),
                    fecha_final = VALUES(fecha_final),
                    fecha_retiro = VALUES(fecha_retiro),
                    traslado_oficina_destino = VALUES(traslado_oficina_destino),
                    dias_ausencia = VALUES(dias_ausencia),
                    observacion = VALUES(observacion),
                    jornada = VALUES(jornada),
                    correo = VALUES(correo),
                    estado = VALUES(estado),
                    banco = VALUES(banco),
                    cuenta_bancaria = VALUES(cuenta_bancaria),
                    tipo_cuenta = VALUES(tipo_cuenta)
            `;

            const params = [
                row.empleador, row.cedula, row.nombre, row.cargo, row.fecha_ingreso, row.contrato, row.tipo_empleado,
                row.regional, row.zona, row.ciudad, row.unidad_negocio, row.cliente, row.empresa, row.codigo_ptr,
                row.cc_helisa, row.oficina, row.vacante_sobrante, row.planta_aprobada, row.supervisor_gerente,
                'RETIRADO', row.novedad, row.motivo_retiro || 'RETIRO', row.fecha_inicial, row.fecha_final, fechaRetiro,
                row.traslado_oficina_destino, row.dias_ausencia, row.observacion, row.jornada, row.correo,
                row.estado, row.banco, row.cuenta_bancaria, row.tipo_cuenta
            ];

            await connection.execute(insertQuery, params);

            // 3. Eliminar el registro de planta_operaciones
            await connection.execute('DELETE FROM planta_operaciones WHERE id_planta = ?', [id]);

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async transferirYLimpiar(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Obtener la fila actual de planta_operaciones
            const [rows] = await connection.execute('SELECT * FROM planta_operaciones WHERE id_planta = ?', [id]);
            if (rows.length === 0) {
                throw new Error('Registro no encontrado en Planta de Operación');
            }
            const row = rows[0];

            if (!row.cedula && !row.nombre) {
                throw new Error('Este registro no tiene un empleado asignado para transferir');
            }

            // Si fecha_retiro no está establecida, usamos el día de hoy
            const fechaRetiro = row.fecha_retiro || new Date().toISOString().split('T')[0];

            // 2. Insertar/Actualizar en retirados
            const insertQuery = `
                INSERT INTO retirados (
                    empleador, cedula, nombre, cargo, fecha_ingreso, contrato, tipo_empleado,
                    regional, zona, ciudad, unidad_negocio, cliente, empresa, codigo_ptr,
                    cc_helisa, oficina, vacante_sobrante, planta_aprobada, supervisor_gerente,
                    status, novedad, motivo_retiro, fecha_inicial, fecha_final, fecha_retiro,
                    traslado_oficina_destino, dias_ausencia, observacion, jornada, correo,
                    estado, banco, cuenta_bancaria, tipo_cuenta
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    empleador = VALUES(empleador),
                    nombre = VALUES(nombre),
                    cargo = VALUES(cargo),
                    fecha_ingreso = VALUES(fecha_ingreso),
                    contrato = VALUES(contrato),
                    tipo_empleado = VALUES(tipo_empleado),
                    regional = VALUES(regional),
                    zona = VALUES(zona),
                    ciudad = VALUES(ciudad),
                    unidad_negocio = VALUES(unidad_negocio),
                    cliente = VALUES(cliente),
                    empresa = VALUES(empresa),
                    codigo_ptr = VALUES(codigo_ptr),
                    cc_helisa = VALUES(cc_helisa),
                    oficina = VALUES(oficina),
                    vacante_sobrante = VALUES(vacante_sobrante),
                    planta_aprobada = VALUES(planta_aprobada),
                    supervisor_gerente = VALUES(supervisor_gerente),
                    status = VALUES(status),
                    novedad = VALUES(novedad),
                    motivo_retiro = VALUES(motivo_retiro),
                    fecha_inicial = VALUES(fecha_inicial),
                    fecha_final = VALUES(fecha_final),
                    fecha_retiro = VALUES(fecha_retiro),
                    traslado_oficina_destino = VALUES(traslado_oficina_destino),
                    dias_ausencia = VALUES(dias_ausencia),
                    observacion = VALUES(observacion),
                    jornada = VALUES(jornada),
                    correo = VALUES(correo),
                    estado = VALUES(estado),
                    banco = VALUES(banco),
                    cuenta_bancaria = VALUES(cuenta_bancaria),
                    tipo_cuenta = VALUES(tipo_cuenta)
            `;

            const params = [
                row.empleador, row.cedula, row.nombre, row.cargo, row.fecha_ingreso, row.contrato, row.tipo_empleado,
                row.regional, row.zona, row.ciudad, row.unidad_negocio, row.cliente, row.empresa, row.codigo_ptr,
                row.cc_helisa, row.oficina, row.vacante_sobrante, row.planta_aprobada, row.supervisor_gerente,
                'RETIRADO', row.novedad, row.motivo_retiro || 'RETIRO', row.fecha_inicial, row.fecha_final, fechaRetiro,
                row.traslado_oficina_destino, row.dias_ausencia, row.observacion, row.jornada, row.correo,
                row.estado, row.banco, row.cuenta_bancaria, row.tipo_cuenta
            ];

            await connection.execute(insertQuery, params);

            // 3. Limpiar los datos personales del registro en planta_operaciones
            const updateQuery = `
                UPDATE planta_operaciones SET
                    cedula = NULL,
                    nombre = NULL,
                    fecha_ingreso = NULL,
                    fecha_retiro = NULL,
                    motivo_retiro = NULL,
                    correo = NULL,
                    correo_corp = NULL,
                    usuario_ad = NULL,
                    usuario_osticket = NULL,
                    banco = NULL,
                    cuenta_bancaria = NULL,
                    tipo_cuenta = NULL,
                    novedad = NULL,
                    fecha_inicial = NULL,
                    fecha_final = NULL,
                    dias_ausencia = 0,
                    estado = NULL,
                    status = 'VACANTE',
                    observacion = NULL
                WHERE id_planta = ?
            `;

            await connection.execute(updateQuery, [id]);

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getRetirados() {
        try {
            const [rows] = await pool.execute('SELECT * FROM retirados ORDER BY id_planta ASC');
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PlantaOperacion;

