const db = require('../../../config/db');

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
                const pk = Object.keys(rows[0])[0];
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
        if (!value || value === '' || value === 'null') return null;
        const normalized = value.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const list = this.data[tableName] || [];
        
        // Exact match
        let match = list.find(item => item.label === normalized);
        if (match) return match.id;

        // Partial match
        match = list.find(item => normalized.includes(item.label) || item.label.includes(normalized));
        return match ? match.id : null;
    }
}

const process = async (jsonData) => {
    let processed = 0;
    let inserted = 0;
    let errors = [];

    const resolver = new MasterMemoryResolver();
    await resolver.init();

    const parseDate = (val) => {
        if (!val) return null;
        if (typeof val === 'number') {
            return new Date(Math.round((val - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
        }
        if (typeof val === 'string') {
            const parts = val.split(/[/-]/);
            if (parts.length === 3) {
                if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        return null;
    };

    const cleanNum = (val) => {
        if (!val) return 0;
        const num = parseFloat(val.toString().replace(/[$, ]/g, '').replace(/,/g, ''));
        return isNaN(num) ? 0 : num;
    };

    for (const row of jsonData) {
        processed++;
        const cedula = row['CEDULA'] || row['Cedula'] || row['cedula'];
        if (!cedula) continue;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Resolve IDs in memory
            const genderId = resolver.resolve('master_type_gender', row['GENERO']);
            const bloodId = resolver.resolve('master_type_blood', row['RH']);
            const orientationId = resolver.resolve('master_sexual_orientation', row['ORIENTACION SEXUAL']);
            const specialPopId = resolver.resolve('master_special_population', row['POBLACION ESPECIAL']);
            const ethnicId = resolver.resolve('master_ethnic_group', row['GRUPO ETNICO']);
            const housingId = resolver.resolve('master_type_housing', row['TIPO DE VIVIENDA']);
            const vehicleId = resolver.resolve('master_type_vehicle', row['¿Cuenta con vehículo Propio?'] || row['CUENTA CON VEHICULO PROPIO']);
            const epsId = resolver.resolve('master_eps', row['SALUD']);
            const pensionId = resolver.resolve('master_pension', row['PENSION']);
            const ccfId = resolver.resolve('master_compensation_box', row['CAJA']);
            const arlId = resolver.resolve('master_arl', row['ARL']); // Added ARL processing
            const jobTitleId = resolver.resolve('master_job_titles', row['CARGO']);
            const contractId = resolver.resolve('master_contracts', row['TIPO DE CONTRATO']);
            const clientId = resolver.resolve('master_client', row['CLIENTE']);
            const cityWorkId = resolver.resolve('master_cities', row['CIUDAD']);
            const costCenterId = resolver.resolve('cost_center', row['CECO']);
            const officeId = resolver.resolve('master_offices', row['OFICINA']);
            const companyId = resolver.resolve('master_company', row['EMPRESA'] || row['COMPAÑIA']);
            const areaId = resolver.resolve('master_area', row['ZONA'] || row['DEPARTAMENTO']);
            const unitId = resolver.resolve('master_unit', row['UNIDAD DE NEGOCIO']);
            const statusId = resolver.resolve('status_master', row['ESTADO']);

            // 2. PEOPLE_DETAILS
            const [detResult] = await connection.execute(
                `INSERT INTO people_details (orientation_id, special_population_id, ethnic_id, stratum, partner_name, neighborhood, address, children_count, partner_id_number, size_shirt, size_jean, size_shoes, size_jacket, size_vest, blood_id, housing_id, vehicle_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [orientationId, specialPopId, ethnicId, cleanNum(row['ESTRATO']), row['NOMBRE DE LA PAREJA'], row['BARRIO'] ? row['BARRIO'].substring(0, 50) : null, row['DIRECCION'] ? row['DIRECCION'].substring(0, 100) : null, cleanNum(row['N° DE HIJO']), row['N° DE LA PAREJA'], row['T. CAMISA'], row['T. PANTALON'], row['T. ZAPATOS'], row['T. CHAQUETAS'], row['T. CHALECOS'], bloodId, housingId, vehicleId]
            );
            const detailsId = detResult.insertId;

            // 3. BUSINESS_PEOPLE_DATA
            const [bizResult] = await connection.execute(
                `INSERT INTO business_people_data (client_id, city_work_id, contract_id, salary, start_date, termination_date, job_title, cost_center_id, company_id, area_id, unit_id, status_id, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [clientId, cityWorkId, contractId, cleanNum(row['SUELDO 2026']), parseDate(row['FECHA DE INGRESO']), parseDate(row['FECHA DE RETIRO']), jobTitleId, costCenterId, companyId, areaId, unitId, statusId, row['MOTIVO DE RETIRO'] ? row['MOTIVO DE RETIRO'].substring(0, 200) : null]
            );
            const bizId = bizResult.insertId;

            // 4. PEOPLE
            let email = row['CORREO ELECTRONICO'] ? row['CORREO ELECTRONICO'].toString().trim() : null;
            if (email === '') email = null; // Prevent Duplicate entry '' for key 'email'

            const [pResult] = await connection.execute(
                `INSERT INTO people (document_number, first_name, last_name, email, phone_number, birthdate, registration_date, gender_id, details_id, people_business_id, type_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cedula, row['APELLIDOS Y NOMBRES']?.split(' ')[0] || 'N/A', row['APELLIDOS Y NOMBRES']?.split(' ').slice(1).join(' ') || 'N/A', email, row['TELEFONO'], parseDate(row['FECHA NACIMIENTO']), parseDate(row['FECHA DE INGRESO']), genderId, detailsId, bizId, 1]
            );
            const peopleId = pResult.insertId;

            // 5. PEOPLE_EXTENDED_INFO
            const refMetadata = `${row['Su Hoja de Vida ha sido referida...'] || ''} | ${row['si su respuesta es Si...'] || ''}`.substring(0, 50);
            const pepMetadata = `${row['Tiene familiares publicamente expuestos ?'] || ''} | ${row['Por que esta publicamente expuesto ?'] || ''}`.substring(0, 255);
            
            await connection.execute(
                `INSERT INTO people_extended_info (people_id, ref_int_metadata, pep_metadata, name_emergency, number_phone_emergency, contact_relationship)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [peopleId, refMetadata, pepMetadata, row['NOMBRE CONTACTO DE EMERGENCIA'], row['CEL DE EMERGENCIA'], row['PARENTESCO DEL CONTACTO']]
            );

            // 6. PEOPLE_HEALT_SECURITY
            const bankAcc = typeof row['CUENTA BANCARIA'] === 'string' ? row['CUENTA BANCARIA'].substring(0, 20) : row['CUENTA BANCARIA'];
            await connection.execute(
                `INSERT INTO people_healt_security (people_id, eps_id, pension_id, compensation_box_id, bank_account, data_processing_authorization, arl_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [peopleId, epsId, pensionId, ccfId, bankAcc, row['AUTORIZACION TRAMITE DE DATOS'] === 'SI' ? 1 : 0, arlId]
            );

            await connection.commit();
            inserted++;
        } catch (err) {
            await connection.rollback();
            console.error(`Error procesando cédula ${cedula}:`, err);
            errors.push(`Cédula ${cedula}: ${err.message}`);
        } finally {
            connection.release();
        }
    }

    return { success: true, processed, inserted, errors };
};

module.exports = { process };
