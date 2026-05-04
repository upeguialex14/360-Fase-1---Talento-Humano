/**
 * Servicio de Orden de Contratación
 * Tabla: HIRING_ORDER
 */
const pool = require('../../config/db');
const OrdenContratacion = require('../../models/etl/ordenContratacion.model.js');

/**
 * Helper para limpiar y normalizar valores antes de ir a DB
 */
/**
 * Helper para limpiar y formatear fechas (maneja casos como '27/05/1990 CUCUTA')
 */
const cleanDate = (value) => {
    if (!value || value === '' || value === 'null') return null;

    const str = value.toString().trim();
    // Buscar patrón DD/MM/YYYY o DD-MM-YYYY
    const matchDMY = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (matchDMY) {
        const [_, day, month, year] = matchDMY;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Buscar patrón YYYY-MM-DD
    const matchYMD = str.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (matchYMD) {
        const [_, year, month, day] = matchYMD;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return null;
};

const cleanValue = (key, value) => {
    if (value === '' || value === undefined || value === null) return null;

    // Campos booleanos (TINYINT)
    if (key === 'polygraph_test') {
        if (typeof value === 'boolean') return value ? 1 : 0;
        const val = value.toString().toUpperCase().trim();
        return (val === 'SI' || val === '1' || val === 'VERDADERO' || val === 'TRUE') ? 1 : 0;
    }

    // Campos numéricos
    const numericFields = [
        'id_job', 'user_id', 'contract_id', 'city_id', 'client_id', 'cost_center_id',
        'plant_id', 'office_id', 'status_id', 'leader_id', 'probation_days',
        'company_id', 'area_id', 'unit_id', 'salary', 'blood_id', 'gender_id',
        'marital_status_id', 'eps_id', 'pension_id', 'arl_id', 'compensation_box_id', 'severance_id'
    ];
    if (numericFields.includes(key)) {
        if (value === null || value === undefined) return null;
        const cleanStr = value.toString().replace(/[$, ]/g, '').replace(/,/g, '');
        const num = parseFloat(cleanStr);
        return isNaN(num) ? null : num;
    }

    // Fechas
    if (['hire_date', 'probation_end_date', 'start_date', 'birthdate', 'birth_date'].includes(key)) {
        return cleanDate(value);
    }

    return value;
};

const OrdenContratacionService = {

    /**
     * Resuelve nombres a IDs consultando los maestros
     */
    async _resolveIds(record) {
        const [
            jobs, contracts, users, clients, cities,
            costCenters, offices, companies, areas, units,
            eps, pension, arl, ccf, rh
        ] = await Promise.all([
            pool.execute('SELECT id_job as id, job_title as nombre FROM MASTER_JOB_TITLES').then(([rows]) => rows),
            pool.execute('SELECT contract_id as id, name_contract as nombre FROM MASTER_CONTRACTS').then(([rows]) => rows),
            pool.execute("SELECT user_id as id, document_number as nombre FROM USERS").then(([rows]) => rows),
            pool.execute('SELECT client_id as id, name as nombre FROM MASTER_CLIENT').then(([rows]) => rows),
            pool.execute('SELECT city_id as id, name as nombre FROM master_cities').then(([rows]) => rows),
            pool.execute('SELECT cost_center_id as id, helisa_cc as nombre FROM COST_CENTER').then(([rows]) => rows),
            pool.execute('SELECT office_id as id, name as nombre FROM MASTER_OFFICES').then(([rows]) => rows),
            pool.execute('SELECT company_id as id, name as nombre FROM MASTER_COMPANY').then(([rows]) => rows),
            pool.execute('SELECT area_id as id, name as nombre FROM MASTER_AREA').then(([rows]) => rows),
            pool.execute('SELECT unit_id as id, name as nombre FROM MASTER_UNIT').then(([rows]) => rows),
            pool.execute('SELECT eps_id as id, name_eps as nombre FROM MASTER_EPS').then(([rows]) => rows),
            pool.execute('SELECT pension_id as id, name_fund as nombre FROM MASTER_PENSION').then(([rows]) => rows),
            pool.execute('SELECT arl_id as id, name_arl as nombre FROM MASTER_ARL').then(([rows]) => rows),
            pool.execute('SELECT compesation_box_id as id, name_compesation_box as nombre FROM MASTER_COMPENSATION_BOX').then(([rows]) => rows),
            pool.execute('SELECT blood_id as id, type_blood as nombre FROM MASTER_TYPE_BLOOD').then(([rows]) => rows),
        ]);

        const findId = (list, name, context) => {
            if (!name || name === '-' || name === 'null' || name === '') return null;
            const normalizedSearch = name.toString().toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            // 1. Intento de coincidencia exacta
            let item = list.find(i => {
                if (!i.nombre) return false;
                const normalizedItem = i.nombre.toString().toLowerCase().trim()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return normalizedItem === normalizedSearch;
            });

            // 2. Intento de coincidencia flexible (si no hubo exacta)
            if (!item) {
                item = list.find(i => {
                    if (!i.nombre) return false;
                    const normalizedItem = i.nombre.toString().toLowerCase().trim()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

                    if (context === 'RH') {
                        return normalizedSearch.startsWith(normalizedItem);
                    }
                    // Para EPS, AFP, Cargo, etc. probar si uno contiene al otro
                    return normalizedSearch.includes(normalizedItem) || normalizedItem.includes(normalizedSearch);
                });
            }

            if (!item) {
                if (list.length > 0) {
                    console.log(`[DEBUG] No se encontró coincidencia para [${context}]: "${name}"`);
                }
                return null;
            }
            return item.id;
        };

        return {
            id_job: record.id_job || findId(jobs, record.cargo, 'Cargo'),
            user_id: record.user_id || cleanValue('user_id', record.identificacion),
            contract_id: record.contract_id || findId(contracts, record.tipo_contrato, 'Contrato'),
            client_id: record.client_id || findId(clients, record.cliente, 'Cliente'),
            city_id: record.city_id || findId(cities, record.ciudad, 'Ciudad'),
            cost_center_id: record.cost_center_id || findId(costCenters, record.centro_costos, 'Centro Costos'),
            office_id: record.office_id || findId(offices, record.oficina, 'Oficina'),
            company_id: record.company_id || findId(companies, record.empleador, 'Empresa'),
            area_id: record.area_id || findId(areas, record.zona, 'Zona'),
            unit_id: record.unit_id || findId(units, record.unidad, 'Unidad'),
            eps_id: record.eps_id || findId(eps, record.eps, 'EPS'),
            pension_id: record.pension_id || findId(pension, record.afp, 'AFP'),
            arl_id: record.arl_id || findId(arl, record.arl, 'ARL'),
            compensation_box_id: record.compensation_box_id || findId(ccf, record.ccf, 'CCF'),
            blood_id: record.blood_id || findId(rh, record.rh, 'RH'),
            leader_id: record.leader_id || cleanValue('leader_id', record.identificacion_jefe)
        };
    },

    async _savePeopleData(record) {
        if (!record.identificacion) return null;

        // 1. PEOPLE (Check if exists)
        const [existing] = await pool.execute('SELECT people_id, details_id FROM PEOPLE WHERE document_number = ?', [record.identificacion]);
        let peopleId;
        let detailsId;

        const firstName = (record.nombre_apellido?.split(' ')[0] || '').substring(0, 100);
        const lastName = (record.nombre_apellido?.split(' ').slice(1).join(' ') || '').substring(0, 100);
        const phone = record.celular ? record.celular.toString().substring(0, 20) : null;
        const doc = record.identificacion ? record.identificacion.toString().substring(0, 20) : '';
        const birthDate = cleanDate(record.fecha_nacimiento);

        if (existing.length > 0) {
            peopleId = existing[0].people_id;
            detailsId = existing[0].details_id;
            await pool.execute('UPDATE PEOPLE SET first_name = ?, last_name = ?, birthdate = ?, phone_number = ? WHERE people_id = ?',
                [firstName, lastName, birthDate, phone, peopleId]);
        } else {
            const [result] = await pool.execute('INSERT INTO PEOPLE (document_number, first_name, last_name, birthdate, phone_number, type_id) VALUES (?, ?, ?, ?, ?, ?)',
                [doc, firstName, lastName, birthDate, phone, 1]);
            peopleId = result.insertId;
        }

        // 2. PEOPLE_DETAILS (Linked via details_id in PEOPLE)
        if (!detailsId) {
            const [detResult] = await pool.execute('INSERT INTO PEOPLE_DETAILS (address, blood_id) VALUES (?, ?)', [record.direccion || null, record.blood_id || null]);
            detailsId = detResult.insertId;
            await pool.execute('UPDATE PEOPLE SET details_id = ? WHERE people_id = ?', [detailsId, peopleId]);
        } else {
            await pool.execute('UPDATE PEOPLE_DETAILS SET address = ?, blood_id = ? WHERE details_id = ?', [record.direccion || null, record.blood_id || null, detailsId]);
        }

        // 3. PEOPLE_HEALT_SECURITY
        const [existingHealth] = await pool.execute('SELECT healt_security_id FROM PEOPLE_HEALT_SECURITY WHERE people_id = ?', [peopleId]);
        const healthParams = [
            record.eps_id || null,
            record.pension_id || null,
            record.arl_id || null,
            record.compensation_box_id || null,
            record.cuenta_bancaria || record.bank_account || null,
            peopleId
        ];

<<<<<<< HEAD
        if (existingHealth.length > 0) {
            await pool.execute('UPDATE PEOPLE_HEALT_SECURITY SET eps_id = ?, pension_id = ?, arl_id = ?, compensation_box_id = ?, bank_account = ? WHERE people_id = ?', healthParams);
        } else {
            await pool.execute('INSERT INTO PEOPLE_HEALT_SECURITY (people_id, eps_id, pension_id, arl_id, compensation_box_id, bank_account) VALUES (?, ?, ?, ?, ?, ?)',
                [peopleId, healthParams[0], healthParams[1], healthParams[2], healthParams[3], healthParams[4]]);
        }

        return peopleId;
    },

    async _saveBusinessData(orderId, record) {
        const businessData = {
            salary: record.salario,
            start_date: cleanDate(record.fecha_ingreso || record.hire_date),
            termination_date: cleanDate(record.fecha_retiro || record.termination_date),
            notes: record.observaciones || record.notes || null,
            job_title: record.id_job,
            client_id: record.client_id,
            city_work_id: record.city_id,
            contract_id: record.contract_id,
            cost_center_id: record.cost_center_id,
            company_id: record.company_id,
            area_id: record.area_id,
            unit_id: record.unit_id,
            status_id: 1
        };

        const cleanData = {};
        for (const [key, val] of Object.entries(businessData)) {
            cleanData[key] = cleanValue(key, val);
        }

        const [existing] = await pool.execute('SELECT order_id FROM BUSINESS_PEOPLE_DATA WHERE order_id = ?', [orderId]);
        if (existing.length > 0) {
            const setClause = Object.keys(cleanData).map(k => `\`${k}\` = ?`).join(', ');
            await pool.execute(`UPDATE BUSINESS_PEOPLE_DATA SET ${setClause} WHERE order_id = ?`, [...Object.values(cleanData), orderId]);
        } else {
            const cols = ['order_id', ...Object.keys(cleanData)];
            const placeholders = new Array(cols.length).fill('?').join(', ');
            await pool.execute(`INSERT INTO BUSINESS_PEOPLE_DATA (${cols.join(', ')}) VALUES (${placeholders})`, [orderId, ...Object.values(cleanData)]);
        }
    },

    async upsertRecords(records, selectedColumns, username) {
        if (!records || !Array.isArray(records)) throw new Error('Datos inválidos');

        for (const record of records) {
            const resolvedIds = await this._resolveIds(record);
            const fullRecord = { ...record, ...resolvedIds };

            // 1. Guardar datos personales (PEOPLE, DETAILS, HEALTH)
            await this._savePeopleData(fullRecord);

            // 2. Guardar HIRING_ORDER
            const validHiringColumns = [
                'id_job', 'user_id', 'detail_justification', 'polygraph_test',
                'hire_date', 'probation_end_date', 'probation_days', 'uploaded_by',
                'update_by', 'cost_center_id', 'plant_id', 'office_id', 'contract_id',
                'city_id', 'client_id', 'status_id', 'selection_confirmed',
                'selection_hiring_confirmed', 'leader_id'
            ];

            const cleanHiring = {};
            const mapping = {
                detalle: 'detail_justification',
                poligrafia: 'polygraph_test',
                fecha_ingreso: 'hire_date',
                fin_prueba: 'probation_end_date',
                dias_prueba: 'probation_days',
                confirmacion_seleccion: 'selection_confirmed'
            };

            const translated = { ...fullRecord };
            for (const [f, d] of Object.entries(mapping)) {
                if (fullRecord[f] !== undefined) translated[d] = fullRecord[f];
            }

            // Agregar Banco al detalle si existe
            if (record.bh) {
                translated.detail_justification = `${translated.detail_justification || ''} [Banco: ${record.bh}]`.trim();
            }

            for (const col of validHiringColumns) {
                if (translated[col] !== undefined) cleanHiring[col] = cleanValue(col, translated[col]);
            }

            let orderId = record.order_id;
            if (orderId) {
                await OrdenContratacion.updateByOrderId(orderId, cleanHiring, username);
            } else {
                orderId = await OrdenContratacion.insert({ ...cleanHiring, uploaded_by: username, update_by: username });
            }

            // 3. Guardar BUSINESS_PEOPLE_DATA
            await this._saveBusinessData(orderId, { ...translated, ...cleanHiring });
        }

        return { success: true, message: 'Integración total completada con éxito' };
    },

    async getAllRecords() {
        const records = await OrdenContratacion.getAll();
        return { success: true, data: records };
    },

    async bulkUpdate(modifiedRows, username) {
        if (!modifiedRows || !Array.isArray(modifiedRows)) throw new Error('No hay filas');

        for (const row of modifiedRows) {
            const resolved = await this._resolveIds(row);
            const fullRow = { ...row, ...resolved };

            await this._savePeopleData(fullRow);

            const editableColumns = [
                'id_job', 'user_id', 'detail_justification', 'polygraph_test',
                'hire_date', 'probation_end_date', 'probation_days',
                'cost_center_id', 'office_id', 'contract_id', 'city_id', 'client_id', 'leader_id'
            ];

            const mapping = {
                detalle: 'detail_justification',
                poligrafia: 'polygraph_test',
                fecha_ingreso: 'hire_date',
                fin_prueba: 'probation_end_date',
                dias_prueba: 'probation_days',
                confirmacion_seleccion: 'selection_confirmed'
            };

            const translated = { ...fullRow };
            for (const [f, d] of Object.entries(mapping)) {
                if (fullRow[f] !== undefined) translated[d] = fullRow[f];
            }

            const updateData = {};
            for (const col of editableColumns) {
                if (translated[col] !== undefined) updateData[col] = cleanValue(col, translated[col]);
            }

            const targetId = row.order_id || row.id;
            if (!targetId || targetId.toString().startsWith('new-')) {
                const newId = await OrdenContratacion.insert({ ...updateData, uploaded_by: username, update_by: username });
                await this._saveBusinessData(newId, { ...translated, ...updateData });
            } else {
                if (Object.keys(updateData).length > 0) {
                    await OrdenContratacion.updateByOrderId(targetId, updateData, username);
                }
                await this._saveBusinessData(targetId, { ...translated, ...updateData });
            }
        }
        return { success: true, message: 'Integración total actualizada' };
    }
};

module.exports = OrdenContratacionService;