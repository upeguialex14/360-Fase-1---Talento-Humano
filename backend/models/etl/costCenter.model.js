/**
 * Modelo de COST_CENTER
 * Encapsula la lógica de DB para el ETL de Centros de Costo utilizando mysql2
 */
const pool = require('../../config/db');
const CostCenter = {
    async bulkInsert(records) {
        if (records.length === 0) return [];

        // 1. Nombres de las columnas en la TABLA de MySQL
        const columns = [
            'ptr', 'helisa_cc', 'office_id', 'client_id',
            'unit_id', 'city_id', 'area_id', 'regional_id',
            'company_id', 'leader_id', //'status_id',
            //'created_at', 'updated_at'
        ];

        let placeholders = [];
        let values = [];

        for (const row of records) {
            placeholders.push(`(${new Array(columns.length).fill('?').join(', ')})`);

            // 2. IMPORTANTE: Los nombres después del 'row.' deben ser EXACTOS 
            // a como salen en tu console.log("Filas a insertar")
            values.push(
                row.ptr ?? null,
                row.helisa_cc ?? null,
                row.office_id ?? null,    // Antes tenías discrepancia aquí
                row.client_id ?? null,    // Antes tenías row.cliente_id (con e)
                row.unit_id ?? null,
                row.city_id ?? null,
                row.area_id ?? null,
                row.regional_id ?? null,
                row.company_id ?? null,
                row.leader_id ?? null,
                //row.status_id ?? 1,       // Valor por defecto si viene vacío
                //row.created_at ?? new Date(),
                //row.updated_at ?? new Date()
            );
        }

        const query = `INSERT IGNORE INTO COST_CENTER (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`;
        const [result] = await pool.execute(query, values);

        return result;
    }
};

module.exports = CostCenter;