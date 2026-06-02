const db = require('../../../config/db');
const { excelDateToJS } = require('../../../helpers/excel.helper');
const fs = require('fs');
const path = require('path');

/**
 * Resolver de IDs Maestros Optimizado (Carga en memoria)
 */
class MasterMemoryResolver {
    constructor() {
        this.data = {};
    }

    async init() {
        const masters = [
            { table: 'master_type_gender', col: 'type_gender' },
            { table: 'master_type_blood', col: 'type_blood' },
            { table: 'master_sexual_orientation', col: 'sexual_orientation' },
            { table: 'master_special_population', col: 'special_population' },
            { table: 'master_ethnic_group', col: 'ethnic_group' },
            { table: 'master_type_housing', col: 'type_housing' },
            { table: 'master_type_vehicle', col: 'type_vehicle' },
            { table: 'master_eps', col: 'name_eps' },
            { table: 'master_pension', col: 'name_fund' },
            { table: 'master_compensation_box', col: 'name_compesation_box' },
            { table: 'master_arl', col: 'name_arl' },
            { table: 'master_job_titles', col: 'job_title' },
            { table: 'master_contracts', col: 'name_contract' },
            { table: 'master_client', col: 'name' },
            { table: 'master_cities', col: 'name' },
            { table: 'cost_center', col: 'helisa_cc' },
            { table: 'master_offices', col: 'name' },
            { table: 'master_company', col: 'name' },
            { table: 'master_area', col: 'name' },
            { table: 'master_unit', col: 'name' },
            { table: 'status_master', col: 'name' }
        ];

        for (const m of masters) {
            try {
                const [rows] = await db.execute(`SELECT * FROM ${m.table}`);
                if (rows.length === 0) {
                    this.data[m.table] = [];
                    continue;
                }
                const columns = Object.keys(rows[0]);
                const pk = columns.find(c => c.toLowerCase().includes('id') || c.toLowerCase().includes('code')) || columns[0];
                
                this.data[m.table] = rows.map(r => ({
                    id: r[pk],
                    label: r[m.col] ? r[m.col].toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ''
                }));
            } catch (e) {
                console.error(`Error loading master ${m.table}:`, e.message);
                this.data[m.table] = [];
            }
        }
    }

    resolve(tableName, value) {
        if (value === undefined || value === null || value === '' || value === 'null') return null;
        const normalized = value.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const list = this.data[tableName] || [];

        let match = list.find(item => item.label === normalized);
        if (match) return match.id;

        match = list.find(item => normalized.includes(item.label) || item.label.includes(normalized));
        return match ? match.id : null;
    }
}

const process = async (jsonData) => {
    let processed = 0;
    let inserted = 0;
    let updated = 0;
    let errors = [];

    const resolver = new MasterMemoryResolver();
    await resolver.init();

    const parseDate = (val) => {
        if (val === undefined || val === null || val === '') return null;
        if (typeof val === 'number') {
            return new Date(Math.round((val - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
        }
        const s = val.toString();
        if (s.includes('T')) return s.split('T')[0];
        const parts = s.split(/[/-]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return null;
    };

    const cleanNum = (val) => {
        if (val === undefined || val === null || val === '') return 0;
        const num = parseFloat(val.toString().replace(/[$, ]/g, '').replace(/,/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const cleanStr = (val, maxLen = 255) => {
        if (val === undefined || val === null || val === '') return null;
        return val.toString().trim().substring(0, maxLen);
    };

    const getVal = (row, keys) => {
        for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null) return row[key];
            const upperKey = key.toUpperCase();
            if (row[upperKey] !== undefined && row[upperKey] !== null) return row[upperKey];
        }
        return null;
    };

    const connection = await db.getConnection();
    try {
        for (const row of jsonData) {
            processed++;
            const cedulaRaw = getVal(row, ['CEDULA', 'Cedula', 'DOCUMENTO']);
            if (!cedulaRaw) continue;
            const cedula = cedulaRaw.toString().trim();

            try {
                await connection.beginTransaction();

                // 1. Resolve IDs
                const genderId = resolver.resolve('master_type_gender', getVal(row, ['GENERO', 'GÉNERO']));
                const bloodId = resolver.resolve('master_type_blood', getVal(row, ['RH']));
                const orientationId = resolver.resolve('master_sexual_orientation', getVal(row, ['ORIENTACION', 'ORIENTACION SEXUAL', 'ORIENTACIÓN']));
                const specialPopId = resolver.resolve('master_special_population', getVal(row, ['POBLACION', 'POBLACION ESPECIAL', 'POBLACIÓN']));
                const ethnicId = resolver.resolve('master_ethnic_group', getVal(row, ['ETNIA', 'GRUPO ETNICO', 'GRUPO ÉTNICO']));
                const housingId = resolver.resolve('master_type_housing', getVal(row, ['VIVIENDA', 'TIPO DE VIVIENDA']));
                const vehicleId = resolver.resolve('master_type_vehicle', getVal(row, ['VEHICULO', '¿Cuenta con vehículo Propio?', 'CUENTA CON VEHICULO PROPIO']));
                const epsId = resolver.resolve('master_eps', getVal(row, ['SALUD', 'EPS']));
                const pensionId = resolver.resolve('master_pension', getVal(row, ['PENSION', 'PENSIÓN', 'FONDO DE PENSIONES']));
                const ccfId = resolver.resolve('master_compensation_box', getVal(row, ['CAJA', 'CAJA DE COMPENSACION']));
                const arlId = resolver.resolve('master_arl', getVal(row, ['ARL']));
                const jobTitleId = resolver.resolve('master_job_titles', getVal(row, ['CARGO']));
                const contractId = resolver.resolve('master_contracts', getVal(row, ['TIPO CONTRATO', 'TIPO DE CONTRATO']));
                const clientId = resolver.resolve('master_client', getVal(row, ['CLIENTE']));
                const cityWorkId = resolver.resolve('master_cities', getVal(row, ['CIUDAD']));
                const costCenterId = resolver.resolve('cost_center', getVal(row, ['CECO']));
                const officeId = resolver.resolve('master_offices', getVal(row, ['OFICINA']));
                const companyId = resolver.resolve('master_company', getVal(row, ['EMPRESA', 'COMPAÑIA', 'COMPAÑÍA']));
                const areaId = resolver.resolve('master_area', getVal(row, ['DEPARTAMENTO', 'ZONA', 'AREA']));
                const unitId = resolver.resolve('master_unit', getVal(row, ['UNIDAD DE NEGOCIO']));
                const statusId = resolver.resolve('status_master', getVal(row, ['ESTADO']));

                // Data mapping
                const detailsData = [
                    orientationId, specialPopId, ethnicId, cleanNum(getVal(row, ['ESTRATO'])), cleanStr(getVal(row, ['PAREJA', 'NOMBRE DE LA PAREJA']), 200),
                    cleanStr(getVal(row, ['BARRIO']), 50), cleanStr(getVal(row, ['DIRECCION', 'DIRECCIÓN']), 100),
                    cleanNum(getVal(row, ['HIJOS', 'N° DE HIJO', 'NRO HIJOS'])), cleanStr(getVal(row, ['N° PAREJA', 'N° DE LA PAREJA', 'DOCUMENTO PAREJA']), 50),
                    cleanStr(getVal(row, ['CAMISA', 'T. CAMISA']), 20), cleanStr(getVal(row, ['PANTALON', 'T. PANTALON']), 20), cleanStr(getVal(row, ['ZAPATOS', 'T. ZAPATOS']), 20),
                    cleanStr(getVal(row, ['CHAQUETA', 'T. CHAQUETAS']), 20), cleanStr(getVal(row, ['CHALECO', 'T. CHALECOS']), 20), bloodId, housingId, vehicleId
                ];

                const bizData = [
                    clientId, cityWorkId, contractId, cleanNum(getVal(row, ['SUELDO 2026', 'SUELDO'])), 
                    parseDate(getVal(row, ['FECHA INGRESO', 'FECHA DE INGRESO'])), parseDate(getVal(row, ['RETIRO', 'FECHA DE RETIRO'])),
                    jobTitleId, costCenterId, companyId, areaId, unitId, statusId, 
                    cleanStr(getVal(row, ['MOTIVO RETIRO', 'MOTIVO DE RETIRO']), 200),
                    officeId
                ];

                const fullNames = cleanStr(getVal(row, ['APELLIDOS Y NOMBRES', 'NOMBRE COMPLETO']), 200) || 'N/A';
                const parts = fullNames.split(' ');
                const firstName = parts[0] || 'N/A';
                const lastName = parts.slice(1).join(' ') || 'N/A';
                const email = cleanStr(getVal(row, ['CORREO', 'CORREO ELECTRONICO', 'EMAIL']), 150);
                const phone = cleanStr(getVal(row, ['TELEFONO', 'TELÉFONO']), 50);
                const birthdate = parseDate(getVal(row, ['NACIMIENTO', 'FECHA NACIMIENTO']));
                const regDate = parseDate(getVal(row, ['FECHA INGRESO', 'FECHA DE INGRESO']));

                const [existing] = await connection.execute(
                    'SELECT people_id, details_id, people_business_id FROM people WHERE document_number = ?',
                    [cedula]
                );

                let peopleId, detailsId, bizId;

                if (existing.length > 0) {
                    peopleId = existing[0].people_id;
                    detailsId = existing[0].details_id;
                    bizId = existing[0].people_business_id;

                    if (detailsId) {
                        await connection.execute(
                            `UPDATE people_details SET orientation_id=?, special_population_id=?, ethnic_id=?, stratum=?, partner_name=?, neighborhood=?, address=?, children_count=?, partner_id_number=?, size_shirt=?, size_jean=?, size_shoes=?, size_jacket=?, size_vest=?, blood_id=?, housing_id=?, vehicle_id=? WHERE details_id=?`,
                            [...detailsData, detailsId]
                        );
                    } else {
                        const [res] = await connection.execute(
                            `INSERT INTO people_details (orientation_id, special_population_id, ethnic_id, stratum, partner_name, neighborhood, address, children_count, partner_id_number, size_shirt, size_jean, size_shoes, size_jacket, size_vest, blood_id, housing_id, vehicle_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            detailsData
                        );
                        detailsId = res.insertId;
                    }

                    if (bizId) {
                        await connection.execute(
                            `UPDATE business_people_data SET client_id=?, city_work_id=?, contract_id=?, salary=?, start_date=?, termination_date=?, job_title=?, cost_center_id=?, company_id=?, area_id=?, unit_id=?, status_id=?, notes=?, office_id=? WHERE people_business_id=?`,
                            [...bizData, bizId]
                        );
                    } else {
                        const [res] = await connection.execute(
                            `INSERT INTO business_people_data (client_id, city_work_id, contract_id, salary, start_date, termination_date, job_title, cost_center_id, company_id, area_id, unit_id, status_id, notes, office_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            bizData
                        );
                        bizId = res.insertId;
                    }

                    await connection.execute(
                        `UPDATE people SET first_name=?, last_name=?, email=?, phone_number=?, birthdate=?, registration_date=?, gender_id=?, details_id=?, people_business_id=?, type_id=1 WHERE people_id=?`,
                        [firstName, lastName, email, phone, birthdate, regDate, genderId, detailsId, bizId, peopleId]
                    );
                    updated++;
                } else {
                    const [detRes] = await connection.execute(
                        `INSERT INTO people_details (orientation_id, special_population_id, ethnic_id, stratum, partner_name, neighborhood, address, children_count, partner_id_number, size_shirt, size_jean, size_shoes, size_jacket, size_vest, blood_id, housing_id, vehicle_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        detailsData
                    );
                    detailsId = detRes.insertId;

                    const [bizRes] = await connection.execute(
                        `INSERT INTO business_people_data (client_id, city_work_id, contract_id, salary, start_date, termination_date, job_title, cost_center_id, company_id, area_id, unit_id, status_id, notes, office_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        bizData
                    );
                    bizId = bizRes.insertId;

                    const [pRes] = await connection.execute(
                        `INSERT INTO people (document_number, first_name, last_name, email, phone_number, birthdate, registration_date, gender_id, details_id, people_business_id, type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [cedula, firstName, lastName, email, phone, birthdate, regDate, genderId, detailsId, bizId, 1]
                    );
                    peopleId = pRes.insertId;
                    inserted++;
                }

                const refMetadata = `${cleanStr(getVal(row, ['HV REFERIDA']), 25) || ''} | ${cleanStr(getVal(row, ['REFERIDO POR']), 25) || ''}`.substring(0, 50);
                const pepMetadata = `${cleanStr(getVal(row, ['FAM PEP']), 25) || ''} | ${cleanStr(getVal(row, ['PORQUE PEP']), 25) || ''}`.substring(0, 255);
                await connection.execute(
                    `INSERT INTO people_extended_info (people_id, ref_int_metadata, pep_metadata, name_emergency, number_phone_emergency, contact_relationship)
                     VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ref_int_metadata=VALUES(ref_int_metadata), pep_metadata=VALUES(pep_metadata), name_emergency=VALUES(name_emergency), number_phone_emergency=VALUES(number_phone_emergency), contact_relationship=VALUES(contact_relationship)`,
                    [peopleId, refMetadata, pepMetadata, cleanStr(getVal(row, ['EMER NOMBRE', 'NOMBRE CONTACTO DE EMERGENCIA']), 150), cleanStr(getVal(row, ['EMER CEL', 'CEL DE EMERGENCIA']), 50), cleanStr(getVal(row, ['EMER PAREN', 'PARENTESCO DEL CONTACTO']), 100)]
                );

                const bankAcc = cleanStr(getVal(row, ['CUENTA', 'CUENTA BANCARIA']), 20);
                await connection.execute(
                    `INSERT INTO people_healt_security (people_id, eps_id, pension_id, compensation_box_id, bank_account, data_processing_authorization, arl_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE eps_id=VALUES(eps_id), pension_id=VALUES(pension_id), compensation_box_id=VALUES(compensation_box_id), bank_account=VALUES(bank_account), data_processing_authorization=VALUES(data_processing_authorization), arl_id=VALUES(arl_id)`,
                    [peopleId, epsId, pensionId, ccfId, bankAcc, getVal(row, ['TRAMITE DATOS']) === 'SI' ? 1 : 0, arlId]
                );

                await connection.commit();
            } catch (err) {
                await connection.rollback();
                const msg = `Cédula ${cedula}: ${err.message}`;
                errors.push(msg);
                try { fs.appendFileSync(path.join(process.cwd(), 'etl_debug.log'), msg + '\n'); } catch(e){}
            }
        }
    } finally {
        connection.release();
    }

    return { success: true, processed, inserted, updated, errors };
};

/**
 * Crea o actualiza UN SOLO registro de persona en la base de datos normalizada
 * a partir de los datos enviados desde el formulario CreacionUsuarioBase.
 */
const createSingle = async (formData) => {
    const resolver = new MasterMemoryResolver();
    await resolver.init();

    const parseDate = (val) => {
        if (!val || val === '') return null;
        const s = val.toString();
        if (s.includes('T')) return s.split('T')[0];
        const parts = s.split(/[/-]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
            return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        }
        return s;
    };

    const cleanNum = (val) => {
        if (val === undefined || val === null || val === '') return 0;
        const num = parseFloat(val.toString().replace(/[$, ]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const cleanStr = (val, maxLen = 255) => {
        if (!val) return null;
        return val.toString().trim().substring(0, maxLen);
    };

    const cedula = formData.cedula?.toString().trim();
    if (!cedula) throw new Error('La cédula es requerida para crear el registro.');

    // Resolver IDs de tablas maestras
    const genderId       = resolver.resolve('master_type_gender',       formData.genero);
    const bloodId        = resolver.resolve('master_type_blood',        formData.rh);
    const orientationId  = resolver.resolve('master_sexual_orientation', formData.orientacion_sexual);
    const specialPopId   = resolver.resolve('master_special_population', formData.poblacion_especial);
    const ethnicId       = resolver.resolve('master_ethnic_group',      formData.grupo_etnico);
    const housingId      = resolver.resolve('master_type_housing',      formData.tipo_vivienda);
    const vehicleId      = resolver.resolve('master_type_vehicle',      formData.cuenta_vehiculo_propio);
    const epsId          = resolver.resolve('master_eps',               formData.salud);
    const pensionId      = resolver.resolve('master_pension',           formData.pension);
    const ccfId          = resolver.resolve('master_compensation_box',  formData.caja);
    const jobTitleId     = resolver.resolve('master_job_titles',        formData.cargo);
    const contractId     = resolver.resolve('master_contracts',         formData.tipo_contrato);
    const clientId       = resolver.resolve('master_client',            formData.cliente);
    const cityWorkId     = resolver.resolve('master_cities',            formData.ciudad);
    const costCenterId   = resolver.resolve('cost_center',              formData.ceco);
    const officeId       = resolver.resolve('master_offices',           formData.oficina);
    const companyId      = resolver.resolve('master_company',           formData.empresa);
    const areaId         = resolver.resolve('master_area',              formData.departamento || formData.zona || '');
    const unitId         = resolver.resolve('master_unit',              formData.unidad_negocio);
    const statusId       = resolver.resolve('status_master',            formData.estado);

    // Construcción de nombre
    const fullName = formData.apellidos_nombres || [
        formData.primer_nombre, formData.segundo_nombre,
        formData.primer_apellido, formData.segundo_apellido
    ].filter(Boolean).join(' ') || 'N/A';

    const firstName = cleanStr([formData.primer_nombre, formData.segundo_nombre].filter(Boolean).join(' '), 100) || fullName.split(' ')[0] || 'N/A';
    const lastName  = cleanStr([formData.primer_apellido, formData.segundo_apellido].filter(Boolean).join(' '), 100) || fullName.split(' ').slice(1).join(' ') || 'N/A';

    const detailsData = [
        orientationId, specialPopId, ethnicId,
        cleanNum(formData.estrato),
        cleanStr(formData.nombre_pareja, 200),
        cleanStr(formData.barrio, 50),
        cleanStr(formData.direccion, 100),
        cleanNum(formData.nro_hijos),
        cleanStr(formData.nro_pareja, 50),
        cleanStr(formData.t_camisa, 20),
        cleanStr(formData.t_pantalon, 20),
        cleanStr(formData.t_zapatos, 20),
        cleanStr(formData.t_chaquetas, 20),
        cleanStr(formData.t_chalecos, 20),
        bloodId, housingId, vehicleId
    ];

    const bizData = [
        clientId, cityWorkId, contractId,
        cleanNum(formData.sueldo_2026),
        parseDate(formData.fecha_ingreso),
        parseDate(formData.fecha_retiro),
        jobTitleId, costCenterId, companyId,
        areaId, unitId, statusId,
        cleanStr(formData.motivo_retiro, 200),
        officeId
    ];

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute(
            'SELECT people_id, details_id, people_business_id FROM people WHERE document_number = ?',
            [cedula]
        );

        let peopleId, detailsId, bizId;

        if (existing.length > 0) {
            // ── ACTUALIZAR ──
            peopleId  = existing[0].people_id;
            detailsId = existing[0].details_id;
            bizId     = existing[0].people_business_id;

            if (detailsId) {
                await connection.execute(
                    `UPDATE people_details SET orientation_id=?, special_population_id=?, ethnic_id=?, stratum=?, partner_name=?, neighborhood=?, address=?, children_count=?, partner_id_number=?, size_shirt=?, size_jean=?, size_shoes=?, size_jacket=?, size_vest=?, blood_id=?, housing_id=?, vehicle_id=? WHERE details_id=?`,
                    [...detailsData, detailsId]
                );
            } else {
                const [detRes] = await connection.execute(
                    `INSERT INTO people_details (orientation_id, special_population_id, ethnic_id, stratum, partner_name, neighborhood, address, children_count, partner_id_number, size_shirt, size_jean, size_shoes, size_jacket, size_vest, blood_id, housing_id, vehicle_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    detailsData
                );
                detailsId = detRes.insertId;
            }

            if (bizId) {
                await connection.execute(
                    `UPDATE business_people_data SET client_id=?, city_work_id=?, contract_id=?, salary=?, start_date=?, termination_date=?, job_title=?, cost_center_id=?, company_id=?, area_id=?, unit_id=?, status_id=?, notes=?, office_id=? WHERE people_business_id=?`,
                    [...bizData, bizId]
                );
            } else {
                const [bizRes] = await connection.execute(
                    `INSERT INTO business_people_data (client_id, city_work_id, contract_id, salary, start_date, termination_date, job_title, cost_center_id, company_id, area_id, unit_id, status_id, notes, office_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    bizData
                );
                bizId = bizRes.insertId;
            }

            await connection.execute(
                `UPDATE people SET first_name=?, last_name=?, email=?, phone_number=?, birthdate=?, registration_date=?, gender_id=?, details_id=?, people_business_id=?, type_id=1 WHERE people_id=?`,
                [firstName, lastName, cleanStr(formData.correo_electronico, 150), cleanStr(formData.telefono, 50), parseDate(formData.fecha_nacimiento), parseDate(formData.fecha_ingreso), genderId, detailsId, bizId, peopleId]
            );
        } else {
            // ── INSERTAR ──
            const [detRes] = await connection.execute(
                `INSERT INTO people_details (orientation_id, special_population_id, ethnic_id, stratum, partner_name, neighborhood, address, children_count, partner_id_number, size_shirt, size_jean, size_shoes, size_jacket, size_vest, blood_id, housing_id, vehicle_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                detailsData
            );
            detailsId = detRes.insertId;

            const [bizRes] = await connection.execute(
                `INSERT INTO business_people_data (client_id, city_work_id, contract_id, salary, start_date, termination_date, job_title, cost_center_id, company_id, area_id, unit_id, status_id, notes, office_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                bizData
            );
            bizId = bizRes.insertId;

            const [pRes] = await connection.execute(
                `INSERT INTO people (document_number, first_name, last_name, email, phone_number, birthdate, registration_date, gender_id, details_id, people_business_id, type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cedula, firstName, lastName, cleanStr(formData.correo_electronico, 150), cleanStr(formData.telefono, 50), parseDate(formData.fecha_nacimiento), parseDate(formData.fecha_ingreso), genderId, detailsId, bizId, 1]
            );
            peopleId = pRes.insertId;
        }

        // Extended info (emergencia + referencias + PEP)
        const refMeta = `${cleanStr(formData.hv_referida, 25) || ''} | ${cleanStr(formData.nombre_referido, 50) || ''}`.substring(0, 100);
        const pepMeta = `${cleanStr(formData.familiares_pep, 25) || ''} | ${cleanStr(formData.porque_pep, 100) || ''}`.substring(0, 255);
        await connection.execute(
            `INSERT INTO people_extended_info (people_id, ref_int_metadata, pep_metadata, name_emergency, number_phone_emergency, contact_relationship)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               ref_int_metadata=VALUES(ref_int_metadata),
               pep_metadata=VALUES(pep_metadata),
               name_emergency=VALUES(name_emergency),
               number_phone_emergency=VALUES(number_phone_emergency),
               contact_relationship=VALUES(contact_relationship)`,
            [peopleId, refMeta, pepMeta,
             cleanStr(formData.nombre_contacto_emergencia, 150),
             cleanStr(formData.cel_emergencia, 50),
             cleanStr(formData.parentesco_contacto, 100)]
        );

        // Salud / seguridad
        await connection.execute(
            `INSERT INTO people_healt_security (people_id, eps_id, pension_id, compensation_box_id, bank_account, data_processing_authorization)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               eps_id=VALUES(eps_id),
               pension_id=VALUES(pension_id),
               compensation_box_id=VALUES(compensation_box_id),
               bank_account=VALUES(bank_account),
               data_processing_authorization=VALUES(data_processing_authorization)`,
            [peopleId, epsId, pensionId, ccfId,
             cleanStr(formData.cuenta_bancaria, 50),
             (formData.autorizacion_tramite_datos === 'SI' || formData.autorizacion_tramite_datos === true) ? 1 : 0]
        );

        await connection.commit();
        return { success: true, peopleId, action: existing.length > 0 ? 'updated' : 'inserted' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { process, createSingle };
