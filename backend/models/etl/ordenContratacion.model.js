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
                ho.order_id,
                ho.user_id                  AS identificacion,
                ho.hire_date                AS fecha_ingreso,
                ho.probation_end_date       AS fin_prueba,
                ho.probation_days           AS dias_prueba,
                ho.detail_justification     AS detalle,
                ho.polygraph_test           AS poligrafia,
                ho.selection_confirmed      AS confirmacion_seleccion,
                ho.created_at,
                ho.update_at,
                ho.uploaded_by,
                ho.update_by,

                -- Persona
                CONCAT(p.first_name, ' ', p.last_name) AS nombre_apellido,
                p.email                     AS correo_electronico,
                p.birthdate                 AS fecha_nacimiento,
                p.phone_number              AS celular,

                -- Maestras de la orden
                mjt.job_title               AS cargo,
                mc.name_contract            AS tipo_contrato,
                mcl.name                    AS cliente,
                mci.name                    AS ciudad,
                cc.helisa_cc                AS centro_costos,
                mo.name                     AS oficina,

                -- Datos de negocio
                bpd.salary                  AS salario,
                bpd.termination_date        AS fecha_retiro,
                mco.name                    AS empleador,
                ma.name                     AS zona,
                mu.name                     AS unidad,

                -- Salud y seguridad
                me.name_eps                 AS eps,
                mafp.name_fund              AS afp,
                marl.name_arl               AS arl,
                mccf.name_compesation_box   AS ccf,
                phs.bank_account            AS bh,

                -- Datos extendidos (mapeados desde las tablas correctas)
                pd.address                  AS direccion,
                pd.neighborhood             AS barrio,
                mtb.type_blood              AS rh,
                pei.cuenta_bancaria         AS cuenta_bancaria,

                -- Líder (via master_leader → USERS)
                CONCAT(ul.name, ' ', ul.last_name) AS jefe,
                ul.email                    AS correo_jefe,

                -- Analista (directo desde USERS via analyst_id)
                CONCAT(ua.name, ' ', ua.last_name) AS analista_encargado

            FROM HIRING_ORDER ho
            LEFT JOIN BUSINESS_PEOPLE_DATA bpd    ON ho.order_id       = bpd.order_id
            LEFT JOIN PEOPLE p                     ON TRIM(ho.user_id)  = TRIM(p.document_number)
            LEFT JOIN PEOPLE_HEALT_SECURITY phs    ON p.people_id       = phs.people_id
            LEFT JOIN people_details pd            ON p.details_id      = pd.details_id
            LEFT JOIN people_extended_info pei     ON p.people_id       = pei.people_id
            LEFT JOIN MASTER_TYPE_BLOOD mtb        ON pd.blood_id       = mtb.blood_id
            LEFT JOIN MASTER_JOB_TITLES mjt        ON ho.id_job         = mjt.id_job
            LEFT JOIN MASTER_CONTRACTS mc          ON ho.contract_id    = mc.contract_id
            LEFT JOIN MASTER_CLIENT mcl            ON ho.client_id      = mcl.client_id
            LEFT JOIN master_cities mci            ON ho.city_id        = mci.city_id
            LEFT JOIN COST_CENTER cc               ON ho.cost_center_id = cc.cost_center_id
            LEFT JOIN MASTER_OFFICES mo            ON ho.office_id      = mo.office_id
            LEFT JOIN MASTER_COMPANY mco           ON bpd.company_id    = mco.company_id
            LEFT JOIN MASTER_AREA ma               ON bpd.area_id       = ma.area_id
            LEFT JOIN MASTER_UNIT mu               ON bpd.unit_id       = mu.unit_id
            LEFT JOIN MASTER_EPS me                ON phs.eps_id        = me.eps_id
            LEFT JOIN MASTER_PENSION mafp          ON phs.pension_id    = mafp.pension_id
            LEFT JOIN MASTER_ARL marl              ON phs.arl_id        = marl.arl_id
            LEFT JOIN MASTER_COMPENSATION_BOX mccf ON phs.compensation_box_id = mccf.compesation_box_id
            LEFT JOIN master_leader ml             ON ho.leader_id      = ml.leader_id
            LEFT JOIN USERS ul                     ON ml.user_id        = ul.user_id
            LEFT JOIN USERS ua                     ON ho.analyst_id     = ua.user_id
            ORDER BY ho.created_at DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    },

    async insert(record) {
        const allowedColumns = [
            'id_job', 'user_id', 'detail_justification', 'polygraph_test',
            'hire_date', 'probation_end_date', 'probation_days',
            'uploaded_by', 'update_by', 'cost_center_id', 'plant_id',
            'office_id', 'contract_id', 'city_id', 'client_id',
            'status_id', 'selection_confirmed', 'selection_hiring_confirmed',
            'leader_id', 'analyst_id'
        ];

        // Build dynamic insert
        const columns = [];
        const values = [];

        allowedColumns.forEach(col => {
            if (record[col] !== undefined && record[col] !== null) {
                columns.push(`\`${col}\``);
                values.push(record[col]);
            }
        });

        columns.push('`created_at`', '`update_at`');
        values.push(new Date(), new Date());

        const [result] = await pool.query(
            `INSERT INTO \`HIRING_ORDER\` (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
            values
        );
        return result.insertId;
    },

    async updateByOrderId(orderId, updates, updateBy) {
        const allowedColumns = [
            'id_job', 'user_id', 'detail_justification', 'polygraph_test',
            'hire_date', 'probation_end_date', 'probation_days',
            'uploaded_by', 'cost_center_id', 'plant_id', 'office_id',
            'contract_id', 'city_id', 'client_id', 'status_id',
            'selection_confirmed', 'selection_hiring_confirmed',
            'leader_id', 'analyst_id'
        ];

        const sets = [];
        const values = [];

        allowedColumns.forEach(key => {
            if (updates[key] !== undefined && updates[key] !== null) {
                sets.push(`\`${key}\` = ?`);
                values.push(updates[key]);
            }
        });

        if (sets.length === 0) return { success: true };

        sets.push('`update_at` = NOW()', '`update_by` = ?');
        values.push(updateBy, orderId);

        await pool.query(
            `UPDATE \`HIRING_ORDER\` SET ${sets.join(', ')} WHERE \`order_id\` = ?`,
            values
        );
        return { success: true };
    },

    async bulkInsert(records) {
        const results = [];
        for (const record of records) {
            results.push(await this.insert(record));
        }
        return results;
    },

    async bulkUpdate(updates) {
        const results = [];
        for (const update of updates) {
            results.push(
                await this.updateByOrderId(update.order_id, update.updates, update.update_by)
            );
        }
        return results;
    }
};

module.exports = OrdenContratacion;