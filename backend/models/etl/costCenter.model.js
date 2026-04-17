/**
 * Modelo de COST_CENTER
 * Encapsula la lógica de DB para el ETL de Centros de Costo utilizando mysql2
 */
const pool = require('../../config/db');

const CostCenter = {
    async bulkInsert(records) {
        if (records.length === 0) return [];
        
        const columns = [
            'ptr', 'helisa_cc', 'oficina_id', 'cliente_id', 
            'unidad_negocio_id', 'ciudad_id', 'zona_id', 'regional_id', 
            'empresa_id', 'lider_id', 'departamento_id', 'estatus_id', 
            'created_at', 'updated_at'
        ];
        
        let placeholders = [];
        let values = [];
        
        for (const row of records) {
            placeholders.push(`(${new Array(columns.length).fill('?').join(', ')})`);
            values.push(
                row.ptr, row.helisa_cc, row.oficina_id, row.cliente_id, 
                row.unidad_negocio_id, row.ciudad_id, row.zona_id, row.regional_id, 
                row.empresa_id, row.lider_id, row.departamento_id, row.status_id, 
                row.created_at, row.updated_at
            );
        }
        
        // IGNORE sirve para saltar los duplicados
        const query = `INSERT IGNORE INTO COST_CENTER (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`;
        const [result] = await pool.execute(query, values);
        
        return result;
    }
};

module.exports = CostCenter;