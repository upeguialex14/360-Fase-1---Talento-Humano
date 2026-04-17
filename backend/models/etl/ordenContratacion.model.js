/**
 * Modelo de Orden de Contratación
 * Encapsulates all orden_contratacion-related database queries
 */
const pool = require('../../config/db.js');

const OrdenContratacion = {
    async findByIdentificacion(identificacion) {
        const [rows] = await pool.execute(
            'SELECT * FROM orden_contratacion WHERE identificacion = ?',
            [identificacion]
        );
        return rows[0] || null;
    },

    async getAll() {
        const [rows] = await pool.execute('SELECT * FROM orden_contratacion ORDER BY fecha_registro DESC');
        return rows;
    },

    async insert(record) {
        const { id, identificacion, usuario_carga, usuario_edicion, ...data } = record;

        // Build dynamic insert
        const columns = ['id', 'identificacion', 'usuario_carga', 'usuario_edicion', 'fecha_registro', 'fecha_actualizacion'];
        const values = [id, identificacion, usuario_carga, usuario_edicion, new Date(), new Date()];

        // Add data columns
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                columns.push(key);
                values.push(data[key]);
            }
        });

        const placeholders = columns.map(() => '?').join(', ');
        const query = `INSERT INTO orden_contratacion (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await pool.execute(query, values);
        return result.insertId;
    },

    async updateByIdentificacion(identificacion, updates, usuario_edicion) {
        const updateSets = [];
        const updateValues = [];

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && updates[key] !== null) {
                updateSets.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateSets.length === 0) return { success: true };

        updateSets.push('fecha_actualizacion = NOW()');
        updateSets.push('usuario_edicion = ?');
        updateValues.push(usuario_edicion);
        updateValues.push(identificacion);

        const query = `UPDATE orden_contratacion SET ${updateSets.join(', ')} WHERE identificacion = ?`;
        await pool.execute(query, updateValues);
        return { success: true };
    },

    async bulkInsert(records) {
        if (records.length === 0) return;

        // For bulk insert, we'll do individual inserts for simplicity
        // Could be optimized with bulk insert later
        const results = [];
        for (const record of records) {
            const result = await this.insert(record);
            results.push(result);
        }
        return results;
    },

    async bulkUpdate(updates) {
        const results = [];
        for (const update of updates) {
            const result = await this.updateByIdentificacion(update.identificacion, update.updates, update.usuario_edicion);
            results.push(result);
        }
        return results;
    }
};

module.exports = OrdenContratacion;