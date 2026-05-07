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
}

module.exports = PlantaOperacion;
