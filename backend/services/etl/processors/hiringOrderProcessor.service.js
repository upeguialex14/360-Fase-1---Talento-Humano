const pool = require('../../../config/db');
const OrdenContratacion = require('../../../models/etl/ordenContratacion.model');
const { excelDateToJS } = require('../../../helpers/excel.helper');

// Helper: normaliza una clave de columna del Excel (tildes, mayúsculas, espacios)
const normalizeKey = (str) =>
    str.toString().toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Crea un mapa normalizado de las keys del row para acceso robusto
const getCol = (row, ...keys) => {
    const normalizedRow = {};
    for (const k of Object.keys(row)) {
        normalizedRow[normalizeKey(k)] = row[k];
    }
    for (const key of keys) {
        const val = normalizedRow[normalizeKey(key)];
        if (val !== undefined && val !== null && val !== '') return val;
    }
    return null;
};

const process = async (rawJson, username = 'Sistema') => {

    // =============================================
    // 1. PRECARGA DE MAESTROS
    // =============================================
    const [
        jobs, contracts, users, clients, cities,
        costCenters, plants, offices, leaders,
        units, companies, areas, typesPeople
    ] = await Promise.all([
        pool.execute('SELECT id_job as id, job_title as nombre FROM MASTER_JOB_TITLES').then(([rows]) => rows),
        pool.execute('SELECT contract_id as id, name as nombre FROM MASTER_CONTRACTS').then(([rows]) => rows),
        pool.execute("SELECT user_id as id, CONCAT(name, ' ', last_name) as nombre FROM USERS").then(([rows]) => rows),
        pool.execute('SELECT client_id as id, name as nombre FROM MASTER_CLIENT').then(([rows]) => rows),
        pool.execute('SELECT city_id as id, name as nombre FROM master_cities').then(([rows]) => rows),
        pool.execute('SELECT cost_center_id as id, name as nombre FROM COST_CENTER').then(([rows]) => rows),
        pool.execute('SELECT plant_id as id, name as nombre FROM OPERATION_PLANT').then(([rows]) => rows),
        pool.execute('SELECT office_id as id, name as nombre FROM MASTER_OFFICES').then(([rows]) => rows),
        pool.execute("SELECT u.user_id as id, CONCAT(u.name, ' ', u.last_name) as nombre FROM USERS u JOIN ROLES r ON u.role_id = r.role_id WHERE r.name_role = 'LIDER'").then(([rows]) => rows),
        pool.execute('SELECT unit_id as id, name as nombre FROM MASTER_UNIT').then(([rows]) => rows),
        pool.execute('SELECT company_id as id, name as nombre FROM MASTER_COMPANY').then(([rows]) => rows),
        pool.execute('SELECT area_id as id, name as nombre FROM MASTER_AREA').then(([rows]) => rows),
        pool.execute('SELECT type_people_id as id, name as nombre FROM MASTER_TYPE_PEOPLE').then(([rows]) => rows),
    ]);

    // =============================================
    // 2. HELPER PARA RESOLVER FKs (mismo patrón que costCenterProcessor)
    // =============================================
    const findId = (list, name) => {
        if (!name || name === '-' || name === 'null') return null;
        const normalizedSearch = name.toString().toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const item = list.find(i => {
            if (!i.nombre) return false;
            const normalizedItem = i.nombre.toString().toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedItem === normalizedSearch;
        });
        return item ? item.id : null;
    };

    if (rawJson.length === 0) {
        return { success: false, message: 'El archivo Excel está vacío' };
    }

    // =============================================
    // 3. TRANSFORMACIÓN DE FILAS
    // =============================================
    const rowsToInsert = [];
    const skipped = [];

    for (const [index, row] of rawJson.entries()) {
        // Usamos getCol() para leer columnas de forma robusta (tildes, mayúsculas, espacios)
        const cedula = getCol(row, 'CEDULA', 'IDENTIFICACION', 'CC', 'DOCUMENTO');

        if (!cedula) {
            skipped.push({ row: index + 2, reason: 'Sin cédula' });
            continue;
        }

        const jobId = findId(jobs, getCol(row, 'CARGO', 'PUESTO'));

        const hiringRecord = {
            id_job: jobId,
            user_id: findId(users, getCol(row, 'NOMBRE Y APELLIDO', 'NOMBRE', 'EMPLEADO')),
            contract_id: findId(contracts, getCol(row, 'TIPO DE CONTRATO', 'CONTRATO')),
            detail_justification: getCol(row, 'DETALLE LA JUSTIFICACION PARA EL CUBRIMIENTO DE LA VACANTE', 'DETALLE JUSTIFICACION', 'DETALLE'),
            hire_date: excelDateToJS(getCol(row, 'FECHA DE INGRESO', 'FECHA INGRESO')),
            probation_end_date: excelDateToJS(getCol(row, 'FIN PERIODO DE PRUEBA', 'FIN PRUEBA')),
            probation_days: getCol(row, 'DIAS (Periodo de prueba)', 'DIAS PRUEBA', 'PERIODO PRUEBA'),
            polygraph_test: 0,
            uploaded_by: username,
            update_by: username,
            status_id: 1,
            client_id: findId(clients, getCol(row, 'CLIENTE')),
            city_id: findId(cities, getCol(row, 'CIUDAD')),
            cost_center_id: findId(costCenters, getCol(row, 'CENTRO DE COSTOS', 'CENTRO DE COSTO', 'CC COSTO')),
            plant_id: findId(plants, getCol(row, 'PLANTA')),
            office_id: findId(offices, getCol(row, 'OFICINA')),
            leader_id: findId(leaders, getCol(row, 'JEFE', 'LIDER')),
        };

        const businessRecord = {
            salary: getCol(row, 'SALARIO'),
            termination_date: excelDateToJS(getCol(row, 'FECHA RETIRO (FIJOS)', 'FECHA RETIRO')),
            start_date: excelDateToJS(getCol(row, 'FECHA DE INGRESO', 'FECHA INGRESO')),
            job_title: jobId,
            client_id: findId(clients, getCol(row, 'CLIENTE')),
            city_work_id: findId(cities, getCol(row, 'CIUDAD')),
            contract_id: findId(contracts, getCol(row, 'TIPO DE CONTRATO', 'CONTRATO')),
            leader_id: findId(leaders, getCol(row, 'JEFE', 'LIDER')),
            cost_center_id: findId(costCenters, getCol(row, 'CENTRO DE COSTOS', 'CENTRO DE COSTO', 'CC COSTO')),
            unit_id: findId(units, getCol(row, 'UNIDAD', 'AREA', 'UNIDAD DE NEGOCIO')),
            company_id: findId(companies, getCol(row, 'EMPRESA')),
            area_id: findId(areas, getCol(row, 'ZONA')),
            type_people_id: findId(typesPeople, getCol(row, 'TIPO PERSONA', 'TIPO DE PERSONA')),
            status_id: 1,
        };

        rowsToInsert.push({ hiringRecord, businessRecord, cedula });
    }

    console.log('Total filas a procesar:', rowsToInsert.length);
    console.log('Filas omitidas:', skipped.length);

    if (rowsToInsert.length === 0) {
        return { success: false, message: 'No hay datos válidos para insertar' };
    }

    // =============================================
    // 4. CARGA: HIRING_ORDER → BUSINESS_PEOPLE_DATA
    // =============================================
    const inserted = [];
    const errors = [];

    for (const { hiringRecord, businessRecord, cedula } of rowsToInsert) {
        try {
            // Paso 1: insertar en HIRING_ORDER y obtener order_id
            const orderId = await OrdenContratacion.insert(hiringRecord);

            // Paso 2: insertar en BUSINESS_PEOPLE_DATA con el order_id
            await pool.execute(
                `INSERT INTO BUSINESS_PEOPLE_DATA 
                (order_id, salary, termination_date, start_date, job_title, client_id,
                 city_work_id, contract_id, leader_id, cost_center_id, unit_id,
                 company_id, area_id, type_people_id, status_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderId,
                    businessRecord.salary,
                    businessRecord.termination_date,
                    businessRecord.start_date,
                    businessRecord.job_title,
                    businessRecord.client_id,
                    businessRecord.city_work_id,
                    businessRecord.contract_id,
                    businessRecord.leader_id,
                    businessRecord.cost_center_id,
                    businessRecord.unit_id,
                    businessRecord.company_id,
                    businessRecord.area_id,
                    businessRecord.type_people_id,
                    businessRecord.status_id
                ]
            );

            inserted.push({ cedula, orderId });
        } catch (error) {
            console.error(`Error procesando cédula ${cedula}:`, error.message);
            errors.push({ cedula, error: error.message });
        }
    }

    return {
        success: true,
        message: `${inserted.length} registros insertados correctamente`,
        totalProcessed: rawJson.length,
        inserted: inserted.length,
        skipped: skipped.length,
        skippedDetails: skipped,
        errors: errors.length > 0 ? errors : undefined
    };
};

module.exports = { process };