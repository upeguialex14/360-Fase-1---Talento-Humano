const pool = require('../../../config/db');
const OrdenContratacion = require('../../../models/etl/ordenContratacion.model');
const { excelDateToJS } = require('../../../helpers/excel.helper');
const bcrypt = require('bcrypt');

// ── Helpers globales ───────────────────────────────────────────────────────────

const norm = (str) => str
    ? str.toString().toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[()]/g, "")
        .replace(/\s+/g, "")
    : "";

const cleanNumeric = (val) => {
    if (!val || val === '') return null;
    if (typeof val === 'number') return val;
    let str = val.toString()
        .replace(/[$ ]/g, '')
        .replace(/,(?=\d{3})/g, '')
        .replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
};

const cleanDate = (val) => {
    if (!val || val === 'null' || val === '-' || val === '') return null;
    if (!isNaN(val) && typeof val !== 'object' && val > 30000) return excelDateToJS(val);
    let str = val.toString().trim();
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) return str.substring(0, 10);
    let match = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    match = str.match(/(\d{1,2})[/-](\d{1,2})(\d{4})/);
    if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    console.warn(`[ETL] No se pudo parsear fecha: "${val}". Se guarda como NULL.`);
    return null;
};

const ROLE_IDS = { LIDER: 4, ANALISTA: 5 };
const TEMP_PASSWORD = 'Temporal2024*';

// ── Busca o crea usuario genérico (analista) ───────────────────────────────────
const findOrCreateUser = async (fullName, roleId) => {
    if (!fullName || fullName.trim() === '') return null;

    const [byName] = await pool.execute(
        `SELECT user_id FROM USERS 
         WHERE LOWER(TRIM(CONCAT(name, ' ', last_name))) = ?`,
        [fullName.toLowerCase().trim()]
    );
    if (byName.length > 0) return byName[0].user_id;

    try {
        const parts = fullName.trim().split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || 'Sin Apellido';
        const userEmail = `${norm(firstName)}.${norm(lastName)}@temporal.com`;
        const hash = await bcrypt.hash(TEMP_PASSWORD, 10);

        const [res] = await pool.execute(
            `INSERT INTO USERS 
                (role_id, email, password_hash, name, last_name, status_id, requires_password_change) 
             VALUES (?, ?, ?, ?, ?, 1, 1)`,
            [roleId, userEmail, hash, firstName, lastName]
        );
        console.log(`[ETL] Usuario creado: ${fullName} → user_id ${res.insertId}`);
        return res.insertId;
    } catch (e) {
        console.warn(`[ETL] No se pudo crear usuario "${fullName}":`, e.message);
        return null;
    }
};

// ── Busca o crea líder (USERS + master_leader) ────────────────────────────────
const findOrCreateLeader = async (fullName, email) => {
    if (!fullName || fullName.trim() === '') return null;

    let userId = null;

    // 1. Buscar por email
    if (email && email.trim() !== '') {
        const [byEmail] = await pool.execute(
            'SELECT user_id FROM USERS WHERE email = ?', [email.trim()]
        );
        if (byEmail.length > 0) userId = byEmail[0].user_id;
    }

    // 2. Buscar por nombre
    if (!userId) {
        const [byName] = await pool.execute(
            `SELECT user_id FROM USERS 
             WHERE LOWER(TRIM(CONCAT(name, ' ', last_name))) = ?`,
            [fullName.toLowerCase().trim()]
        );
        if (byName.length > 0) userId = byName[0].user_id;
    }

    // 3. Crear en USERS si no existe
    if (!userId) {
        try {
            const parts = fullName.trim().split(' ');
            const firstName = parts[0];
            const lastName = parts.slice(1).join(' ') || 'Sin Apellido';
            const userEmail = (email && email.trim() !== '')
                ? email.trim()
                : `${norm(firstName)}.${norm(lastName)}@temporal.com`;
            const hash = await bcrypt.hash(TEMP_PASSWORD, 10);

            const [res] = await pool.execute(
                `INSERT INTO USERS 
                    (role_id, email, password_hash, name, last_name, status_id, requires_password_change) 
                 VALUES (?, ?, ?, ?, ?, 1, 1)`,
                [ROLE_IDS.LIDER, userEmail, hash, firstName, lastName]
            );
            userId = res.insertId;
            console.log(`[ETL] Usuario líder creado: ${fullName} → user_id ${userId}`);
        } catch (e) {
            console.warn(`[ETL] No se pudo crear usuario líder "${fullName}":`, e.message);
            return null;
        }
    }

    // 4. Buscar en master_leader
    const [mlExist] = await pool.execute(
        'SELECT leader_id FROM master_leader WHERE user_id = ?', [userId]
    );
    if (mlExist.length > 0) return mlExist[0].leader_id;

    // 5. Crear en master_leader
    try {
        const [mlRes] = await pool.execute(
            'INSERT INTO master_leader (user_id, status_id) VALUES (?, 1)', [userId]
        );
        console.log(`[ETL] Líder en master_leader: user_id ${userId} → leader_id ${mlRes.insertId}`);
        return mlRes.insertId;
    } catch (e) {
        console.warn(`[ETL] No se pudo crear en master_leader:`, e.message);
        return null;
    }
};

// ── Processor principal ────────────────────────────────────────────────────────
const hiringOrderProcessor = {

    async saveRow(row, masters, username) {

        const findId = async (listKey, name, table, column) => {
            if (!name || name === '-' || name === 'null' || name === '') return null;
            const search = norm(name);
            const list = masters[listKey];
            let item = list.find(i => norm(i.nombre) === search);
            if (item) return item.id;
            if (table && column) {
                try {
                    const [res] = await pool.execute(
                        `INSERT INTO ${table} (${column}, status_id) VALUES (?, 1)`, [name]
                    );
                    const newItem = { id: res.insertId, nombre: name };
                    masters[listKey].push(newItem);
                    return res.insertId;
                } catch (e) {
                    console.warn(`[ETL] No se pudo crear en ${table}:`, name, e.message);
                    return null;
                }
            }
            return null;
        };

        // Normalizar claves del row
        const data = {};
        for (const k of Object.keys(row)) { data[norm(k)] = row[k]; }

        const cedula = data['identificacion'] || data['cedula'] || data['documento'] || row.user_id;
        if (!cedula) {
            console.warn('[ETL] Fila sin cédula, se omite.');
            return null;
        }

        console.log('────────────────────────────────────────────────────');
        console.log('[ETL] PROCESANDO FILA:', cedula);

        // ── Resolución de IDs maestros ─────────────────────────────────────────
        const jobId = data.id_job || await findId('jobs', data['cargo'], 'MASTER_JOB_TITLES', 'job_title');
        const contractId = data.contract_id || await findId('contracts', data['tipo_contrato'] || data['tipodecontrato'], 'MASTER_CONTRACTS', 'name_contract');
        const clientId = data.client_id || await findId('clients', data['cliente'], 'MASTER_CLIENT', 'name');
        const cityId = data.city_id || await findId('cities', row['CIUDAD'] || data['ciudad'], 'master_cities', 'name');
        // ✅ centro de costo: no crear, solo buscar — COST_CENTER no tiene status_id
        const ccId = data.cost_center_id || await findId('costCenters', data['centro_costos'] || data['centrodecosto'], null, null);
        const officeId = data.office_id || await findId('offices', data['oficina'], 'MASTER_OFFICES', 'name');
        const typeId = data.type_people_id || await findId('typesPeople', data['tipo_persona'] || data['tipodepersona'], 'MASTER_TYPE_PEOPLE', 'type_people');
        const companyId = data.company_id || await findId('companies', data['empleador'], 'MASTER_COMPANY', 'name');
        const areaId = data.area_id || await findId('areas', data['zona'], 'MASTER_AREA', 'name');
        const unitId = data.unit_id || await findId('units', data['unidad'], 'MASTER_UNIT', 'name');
        const epsId = data.eps_id || await findId('eps', data['eps'], 'MASTER_EPS', 'name_eps');
        const afpId = data.pension_id || await findId('pension', data['afp'], 'MASTER_PENSION', 'name_fund');
        const arlId = data.arl_id || await findId('arl', data['arl'], 'MASTER_ARL', 'name_arl');
        const ccfId = data.compensation_box_id || await findId('ccf', data['ccf'], 'MASTER_COMPENSATION_BOX', 'name_compesation_box');
        // ✅ RH: no crear, solo buscar — MASTER_TYPE_BLOOD no tiene status_id
        const rhRaw = data['rh'] || null;
        const rhClean = rhRaw ? (rhRaw.toString().toUpperCase().match(/(AB|A|B|O)[+-]/) || [])[0] || null : null;
        const rhId = data.blood_id || await findId('rh', rhClean, null, null);

        // ✅ Jefe: alias del Excel "JEFE INMEDIATO" → norm → "jefeinmediato"
        const leaderId = await findOrCreateLeader(
            data['jefe'] || data['jefeinmediato'] || null,
            data['correo_jefe'] || data['correolider'] || null
        );

        // ✅ Analista: alias del Excel "ANALISTA ENCARGADO" → norm → "analistaencargado"
        const analystId = await findOrCreateUser(
            data['analista_encargado'] || data['analistaencargado'] || null,
            ROLE_IDS.ANALISTA
        );

        console.log('[ETL] IDs resueltos:', {
            jobId, contractId, clientId, cityId, ccId, officeId,
            typeId, companyId, areaId, unitId, epsId, afpId,
            arlId, ccfId, rhId, leaderId, analystId
        });

        // ── 1. HIRING_ORDER ────────────────────────────────────────────────────
        let orderId = row.order_id || data.order_id;

        const hiringData = {
            id_job: jobId,
            user_id: cedula,
            contract_id: contractId,
            client_id: clientId,
            city_id: cityId,
            cost_center_id: ccId,
            office_id: officeId,
            leader_id: leaderId,
            analyst_id: analystId,
            // ✅ Fechas con alias del Excel original y snake_case
            hire_date: cleanDate(data['fecha_ingreso'] || data['fechadeingreso'] || row.hire_date),
            probation_end_date: cleanDate(data['fin_prueba'] || data['finperiododeprueba'] || row.probation_end_date),
            probation_days: cleanNumeric(data['dias_prueba'] || data['diasperiododeprueba'] || row.probation_days),
            // ✅ Detalle con alias largo del Excel
            detail_justification: data['detalle'] || data['detallelajustificacionparaelcubrimientodelavacante'] || row.detail_justification || null,
            polygraph_test: ['SI', 'APROBO', 'APROBÓ', 'APROBADO'].includes(
                (data['poligrafia'] || '').toString().toUpperCase().trim()
            ) ? 1 : 0,
            status_id: 1,
            uploaded_by: username,
            update_by: username
        };

        if (orderId && !orderId.toString().startsWith('new-')) {
            await OrdenContratacion.updateByOrderId(orderId, hiringData, username);
        } else {
            orderId = await OrdenContratacion.insert(hiringData);
        }

        // ── 2. BUSINESS_PEOPLE_DATA ────────────────────────────────────────────
        const bizData = {
            order_id: orderId,
            salary: cleanNumeric(data['salario'] || row.salary),
            job_title: jobId,
            client_id: clientId,
            city_work_id: cityId,
            contract_id: contractId,
            cost_center_id: ccId,
            type_people_id: typeId,
            company_id: companyId,
            area_id: areaId,
            unit_id: unitId,
            start_date: hiringData.hire_date,
            // ✅ fecha retiro con alias del Excel "FECHA RETIRO (FIJOS)" → norm → "fecharetiro"
            termination_date: cleanDate(data['fecha_retiro'] || data['fecharetiro'] || row.termination_date),
            status_id: 1
        };
        const bKeys = Object.keys(bizData);
        await pool.execute(
            `INSERT INTO BUSINESS_PEOPLE_DATA (${bKeys.join(', ')}) 
             VALUES (${bKeys.map(() => '?').join(', ')}) 
             ON DUPLICATE KEY UPDATE ${bKeys.map(k => `\`${k}\`=VALUES(\`${k}\`)`).join(', ')}`,
            Object.values(bizData).map(v => v ?? null)
        );

        // ── 3. PEOPLE ──────────────────────────────────────────────────────────
        // ✅ nombre con alias del Excel "NOMBRE Y APELLIDO" → norm → "nombreyapellido"
        const fullName = data['nombre_apellido'] || data['nombreyapellido'] || row.nombre_apellido || '';
        const firstName = fullName.split(' ')[0] || 'Sin Nombre';
        const lastName = fullName.split(' ').slice(1).join(' ') || 'Sin Apellido';
        const email = data['correo_electronico'] || data['correoelectronico'] || null;
        const phone = data['celular'] || null;
        // ✅ fecha nacimiento con alias del Excel
        const birthDate = cleanDate(data['fecha_nacimiento'] || data['fechadenacimiento'] || row.birthdate);

        const [pExist] = await pool.execute(
            'SELECT people_id FROM PEOPLE WHERE document_number = ?', [cedula]
        );

        let pId;
        if (pExist.length > 0) {
            pId = pExist[0].people_id;
            await pool.execute(
                'UPDATE PEOPLE SET first_name=?, last_name=?, email=?, phone_number=?, birthdate=? WHERE people_id=?',
                [firstName, lastName, email, phone, birthDate, pId].map(v => v ?? null)
            );
        } else {
            const [pRes] = await pool.execute(
                `INSERT INTO PEOPLE 
                    (document_number, first_name, last_name, email, phone_number, birthdate, type_id) 
                 VALUES (?,?,?,?,?,?,1)`,
                [cedula, firstName, lastName, email, phone, birthDate].map(v => v ?? null)
            );
            pId = pRes.insertId;
        }

        // ── 4. PEOPLE_EXTENDED_INFO ────────────────────────────────────────────
        const direccion = data['direccion'] || null;
        // ✅ fecha expedicion con alias del Excel "FECHA DE EXPEDICIÓN CC" → norm → "fechadeexpedicioncc"
        const expedicionDoc = cleanDate(data['fecha_expedicion_cc'] || data['fechadeexpedicioncc']) || null;
        // ✅ cuenta_bancaria y bh son campos independientes
        // ✅ FIX: agregar alias "cuentabancaria" (sin guión, que es lo que produce norm())
        const cuentaRaw = data['cuenta_bancaria'] || data['cuentabancaria'] || null;

        // ✅ Rechaza solo basura evidente, acepta cualquier cosa con al menos un dígito
        const cuentaBancaria = (() => {
            if (!cuentaRaw) return null;
            const str = cuentaRaw.toString().trim();
            // Rechaza valores claramente inválidos
            if (/^(no|n\/a|na|sin cuenta|no s|no aplica)$/i.test(str)) return null;
            // Rechaza si no tiene ningún dígito (ej: "CTA BOGOTA")
            if (!/\d/.test(str)) return null;
            return str;
        })();
        const bh = data['bh'] || null;
        const ciudadPersonal = data['ciudad_personal'] || null;

        if (direccion || expedicionDoc || cuentaBancaria || ciudadPersonal ||
            rhId || email || phone || birthDate) {
            await pool.execute(
                `INSERT INTO people_extended_info 
                    (people_id, direccion, expedicion_documento, cuenta_bancaria,
                     ciudad_residencia, rh, correo_electronico, telefono, fecha_nacimiento)
                 VALUES (?,?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                    direccion            = COALESCE(VALUES(direccion),            direccion),
                    expedicion_documento = COALESCE(VALUES(expedicion_documento), expedicion_documento),
                    cuenta_bancaria      = COALESCE(VALUES(cuenta_bancaria),      cuenta_bancaria),
                    ciudad_residencia    = COALESCE(VALUES(ciudad_residencia),    ciudad_residencia),
                    rh                   = COALESCE(VALUES(rh),                   rh),
                    correo_electronico   = COALESCE(VALUES(correo_electronico),   correo_electronico),
                    telefono             = COALESCE(VALUES(telefono),             telefono),
                    fecha_nacimiento     = COALESCE(VALUES(fecha_nacimiento),     fecha_nacimiento)`,
                [pId, direccion, expedicionDoc, cuentaBancaria,
                    ciudadPersonal, rhId, email, phone, birthDate].map(v => v ?? null)
            );
        }

        // ── 5. PEOPLE_HEALT_SECURITY ───────────────────────────────────────────
        await pool.execute(
            `INSERT INTO PEOPLE_HEALT_SECURITY 
                (people_id, eps_id, pension_id, arl_id, compensation_box_id, bank_account) 
             VALUES (?,?,?,?,?,?) 
             ON DUPLICATE KEY UPDATE 
                eps_id              = COALESCE(VALUES(eps_id),              eps_id),
                pension_id          = COALESCE(VALUES(pension_id),          pension_id),
                arl_id              = COALESCE(VALUES(arl_id),              arl_id),
                compensation_box_id = COALESCE(VALUES(compensation_box_id), compensation_box_id),
                bank_account        = COALESCE(VALUES(bank_account),        bank_account)`,
            // ✅ bank_account = bh, no cuenta_bancaria
            [pId, epsId, afpId, arlId, ccfId, bh].map(v => v ?? null)
        );

        return orderId;
    },

    // ── Carga de maestros ──────────────────────────────────────────────────────
    async _loadMasters() {
        const [
            jobs, contracts, clients, cities, costCenters, offices,
            companies, areas, units, typesPeople, eps, pension, arl, ccf, rh
        ] = await Promise.all([
            pool.execute('SELECT id_job as id, job_title as nombre FROM MASTER_JOB_TITLES').then(([r]) => r),
            pool.execute('SELECT contract_id as id, name_contract as nombre FROM MASTER_CONTRACTS').then(([r]) => r),
            pool.execute('SELECT client_id as id, name as nombre FROM MASTER_CLIENT').then(([r]) => r),
            pool.execute('SELECT city_id as id, name as nombre FROM master_cities').then(([r]) => r),
            pool.execute('SELECT cost_center_id as id, helisa_cc as nombre FROM COST_CENTER').then(([r]) => r),
            pool.execute('SELECT office_id as id, name as nombre FROM MASTER_OFFICES').then(([r]) => r),
            pool.execute('SELECT company_id as id, name as nombre FROM MASTER_COMPANY').then(([r]) => r),
            pool.execute('SELECT area_id as id, name as nombre FROM MASTER_AREA').then(([r]) => r),
            pool.execute('SELECT unit_id as id, name as nombre FROM MASTER_UNIT').then(([r]) => r),
            pool.execute('SELECT type_people_id as id, type_people as nombre FROM MASTER_TYPE_PEOPLE').then(([r]) => r),
            pool.execute('SELECT eps_id as id, name_eps as nombre FROM MASTER_EPS').then(([r]) => r),
            pool.execute('SELECT pension_id as id, name_fund as nombre FROM MASTER_PENSION').then(([r]) => r),
            pool.execute('SELECT arl_id as id, name_arl as nombre FROM MASTER_ARL').then(([r]) => r),
            pool.execute('SELECT compesation_box_id as id, name_compesation_box as nombre FROM MASTER_COMPENSATION_BOX').then(([r]) => r),
            pool.execute('SELECT blood_id as id, type_blood as nombre FROM MASTER_TYPE_BLOOD').then(([r]) => r)
        ]);
        return { jobs, contracts, clients, cities, costCenters, offices, companies, areas, units, typesPeople, eps, pension, arl, ccf, rh };
    },

    // ── Entradas públicas ──────────────────────────────────────────────────────

    async process(rawJson, username) {
        console.log(`[ETL] Procesando Excel con ${rawJson.length} filas`);
        const masters = await this._loadMasters();
        let processed = 0;
        for (const row of rawJson) {
            const result = await this.saveRow(row, masters, username);
            if (result) processed++;
        }
        console.log(`[ETL] Completado: ${processed}/${rawJson.length} filas procesadas`);
        return { success: true, processed };
    },

    async upsertRecords(records, selectedColumns, username) {
        const masters = await this._loadMasters();
        let processed = 0;
        for (const record of records) {
            const result = await this.saveRow(record, masters, username);
            if (result) processed++;
        }
        return { success: true, processed, message: 'Registros procesados correctamente' };
    },

    async bulkUpdate(modifiedRows, username) {
        return this.upsertRecords(modifiedRows, null, username);
    },

    async getAllRecords() {
        const data = await OrdenContratacion.getAll();
        return { success: true, data };
    }
};

module.exports = hiringOrderProcessor;