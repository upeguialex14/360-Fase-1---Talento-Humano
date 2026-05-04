const pool = require('../../config/db.js');

const OrdenContratacion = {
    async findByOrderId(orderId) {
        const [rows] = await pool.query(
            'SELECT * FROM `HIRING_ORDER` WHERE `order_id` = ?',
            [orderId]
        );
        return rows[0] || null;
    },

    async getAll() {
        const query = `
            SELECT 
                ho.*,
                ho.hire_date as fecha_ingreso,
                ho.probation_end_date as fin_prueba,
                ho.probation_days as dias_prueba,
                ho.selection_confirmed as confirmacion_seleccion,
                ho.user_id as identificacion,
                CONCAT(p.first_name, ' ', p.last_name) as nombre_apellido,
                mjt.job_title as cargo,
                mc.name_contract as tipo_contrato,
                mcl.name as cliente,
                mci.name as ciudad,
                cc.helisa_cc as centro_costos,
                mo.name as oficina,
                bpd.salary as salario,
                mco.name as empleador,
                ma.name as zona,
                mu.name as unidad,
                me.name_eps as eps,
                mafp.name_fund as afp,
                marl.name_arl as arl,
                mccf.name_compesation_box as ccf,
                mrh.type_blood as rh,
                pd.address as direccion,
                p.phone_number as celular,
                p.birthdate as fecha_nacimiento,
                CONCAT(ul.name, ' ', ul.last_name) as jefe,
                ul.email as correo_jefe,
                ho.detail_justification as detalle,
                ho.polygraph_test as poligrafia,
                ho.created_at,
                ho.update_at,
                ho.uploaded_by,
                ho.update_by
            FROM HIRING_ORDER ho
            LEFT JOIN BUSINESS_PEOPLE_DATA bpd ON ho.order_id = bpd.order_id
            LEFT JOIN PEOPLE p ON ho.user_id = p.document_number
            LEFT JOIN PEOPLE_DETAILS pd ON p.details_id = pd.details_id
            LEFT JOIN PEOPLE_HEALT_SECURITY phs ON p.people_id = phs.people_id
            LEFT JOIN MASTER_JOB_TITLES mjt ON ho.id_job = mjt.id_job
            LEFT JOIN MASTER_CONTRACTS mc ON ho.contract_id = mc.contract_id
            LEFT JOIN MASTER_CLIENT mcl ON ho.client_id = mcl.client_id
            LEFT JOIN MASTER_CITIES mci ON ho.city_id = mci.city_id
            LEFT JOIN COST_CENTER cc ON ho.cost_center_id = cc.cost_center_id
            LEFT JOIN USERS ul ON ho.leader_id = ul.user_id
            LEFT JOIN MASTER_OFFICES mo ON ho.office_id = mo.office_id
            LEFT JOIN MASTER_COMPANY mco ON bpd.company_id = mco.company_id
            LEFT JOIN MASTER_AREA ma ON bpd.area_id = ma.area_id
            LEFT JOIN MASTER_UNIT mu ON bpd.unit_id = mu.unit_id
            LEFT JOIN MASTER_EPS me ON phs.eps_id = me.eps_id
            LEFT JOIN MASTER_PENSION mafp ON phs.pension_id = mafp.pension_id
            LEFT JOIN MASTER_ARL marl ON phs.arl_id = marl.arl_id
            LEFT JOIN MASTER_COMPENSATION_BOX mccf ON phs.compensation_box_id = mccf.compesation_box_id
            LEFT JOIN MASTER_TYPE_BLOOD mrh ON pd.blood_id = mrh.blood_id
            ORDER BY ho.created_at DESC
        `;
        const [rows] = await pool.query(query);
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

        columns.push('`created_at`', '`update_at`');
        values.push(new Date(), new Date());

        const placeholders = columns.map(() => '?').join(', ');
        const query = `INSERT INTO \`HIRING_ORDER\` (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await pool.query(query, values);
        return result.insertId;
    },

    async updateByOrderId(orderId, updates, updateBy) {
        const allowedColumns = [
            'id_job', 'user_id', 'detail_justification', 'polygraph_test',
            'hire_date', 'probation_end_date', 'probation_days', 'uploaded_by',
            'cost_center_id', 'plant_id', 'office_id', 'contract_id', 'city_id',
            'client_id', 'status_id', 'selection_confirmed',
            'selection_hiring_confirmed', 'leader_id'
        ];

        const updateSets = [];
        const updateValues = [];

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && updates[key] !== null) {
                updateSets.push(`\`${key}\` = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateSets.length === 0) return { success: true };

        updateSets.push('`update_at` = NOW()');
        updateSets.push('`update_by` = ?');
        updateValues.push(updateBy);
        updateValues.push(orderId);

        const query = `UPDATE \`HIRING_ORDER\` SET ${updateSets.join(', ')} WHERE \`order_id\` = ?`;
        await pool.query(query, updateValues);
        return { success: true };
    },

    async bulkInsert(records) {
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
            const result = await this.updateByOrderId(update.order_id, update.updates, update.update_by);
            results.push(result);
        }
        return results;
    }
};

module.exports = OrdenContratacion;