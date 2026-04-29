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
<<<<<<< HEAD
            'ptr', 'helisa_cc', 'office_id', 'client_id',
            'unit_id', 'city_id', 'area_id', 'regional_id',
            'company_id', 'leader_id', //'status_id',
            //'created_at', 'updated_at'
=======
            'ptr', 'helisa_cc', 'oficina_id', 'cliente_id', 
            'unidad_negocio_id', 'ciudad_id', 'zona_id', 'regional_id', 
            'empresa_id', 'lider_id', 'departamento_id', 'status_id', 
            'created_at', 'updated_at'
>>>>>>> b9f3cebe96ae0899db0e35f1e43af9b11e0bbf78
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
    },

    async getAll() {
        const query = `
            SELECT 
                cc.cost_center_id as id,
                cc.ptr as PTR,
                cc.helisa_cc as \`C.C HELISA\`,
                off.name as OFICINA,
                cli.name as CLIENTE,
                uni.name as \`UNIDAD DE NEGOCIO\`,
                cit.name as CIUDAD,
                area.name as ZONA,
                reg.name as REGIONAL,
                comp.name as EMPRESA,
                CONCAT(u.name, ' ', u.last_name) as LIDER
            FROM cost_center cc
            LEFT JOIN master_offices off ON cc.oficina_id = off.office_id
            LEFT JOIN master_client cli ON cc.cliente_id = cli.client_id
            LEFT JOIN master_unit uni ON cc.unidad_negocio_id = uni.unit_id
            LEFT JOIN master_cities cit ON cc.ciudad_id = cit.city_id
            LEFT JOIN master_area area ON cc.zona_id = area.area_id
            LEFT JOIN master_regional reg ON cc.regional_id = reg.regional_id
            LEFT JOIN master_company comp ON cc.empresa_id = comp.company_id
            LEFT JOIN users u ON cc.lider_id = u.user_id
            ORDER BY cc.created_at DESC
            LIMIT 500
        `;
        const [rows] = await pool.query(query);
        return rows;
    }
};

module.exports = CostCenter;