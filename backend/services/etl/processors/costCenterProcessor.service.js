const pool = require('../../../config/db');
const CostCenterModel = require('../../../models/etl/costCenter.model');

const process = async (rawJson) => {
<<<<<<< HEAD
    // 1. Precarga de Maestros
    const [oficinas, clientes, unidadesNegocio, ciudades, zonas, regionales, empresas, departamentos] = await Promise.all([
        pool.execute('SELECT office_id AS id, name FROM MASTER_OFFICES').then(([rows]) => rows),
        pool.execute('SELECT client_id AS id, name FROM MASTER_CLIENT').then(([rows]) => rows),
        pool.execute('SELECT unit_id AS id, name FROM MASTER_UNIT').then(([rows]) => rows),
        pool.execute('SELECT city_id AS id, name FROM MASTER_CITIES').then(([rows]) => rows),
        pool.execute('SELECT area_id AS id, name FROM MASTER_AREA').then(([rows]) => rows),
        pool.execute('SELECT regional_id AS id, name FROM MASTER_REGIONAL').then(([rows]) => rows),
        pool.execute('SELECT company_id AS id, name FROM MASTER_COMPANY').then(([rows]) => rows),
=======
    // Precarga de Maestros (utilizando mysql2 directamente con nombres de tablas reales)
    const [oficinas, clientes, unidadesNegocio, ciudades, zonas, regionales, empresas, lideres, departamentos, status] = await Promise.all([
        pool.execute('SELECT office_id as id, name as nombre FROM master_offices').then(([rows]) => rows),
        pool.execute('SELECT client_id as id, name as nombre FROM master_client').then(([rows]) => rows),
        pool.execute('SELECT unit_id as id, name as nombre FROM master_unit').then(([rows]) => rows),
        pool.execute('SELECT city_id as id, name as nombre FROM master_cities').then(([rows]) => rows),
        pool.execute('SELECT area_id as id, name as nombre FROM master_area').then(([rows]) => rows),
        pool.execute('SELECT regional_id as id, name as nombre FROM master_regional').then(([rows]) => rows),
        pool.execute('SELECT company_id as id, name as nombre FROM master_company').then(([rows]) => rows),
        pool.execute("SELECT u.user_id as id, CONCAT(u.name, ' ', u.last_name) as nombre FROM USERS u JOIN ROLES r ON u.role_id = r.role_id WHERE r.name_role = 'LIDER'").then(([rows]) => rows),
        pool.execute('SELECT departament_id as id, name as nombre FROM master_departament').then(([rows]) => rows),
        pool.execute('SELECT status_id as id, status as nombre FROM status_master').then(([rows]) => rows)
>>>>>>> b9f3cebe96ae0899db0e35f1e43af9b11e0bbf78
    ]);

    const sqlLeaders = `
        SELECT L.leader_id AS id, U.name 
        FROM MASTER_LEADER L
        JOIN USERS U ON L.user_id = U.user_id
    `;
    const [leaders] = await pool.execute(sqlLeaders);

    // Helper encontrar ID con nombre (Normalizado para acentos y mayúsculas)
    const findId = (list, name) => {
        if (!name || name === '-' || name === 'null') return null;
        const normalizedSearch = name.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const item = list.find(i => {
            if (!i.name) return false;
            const normalizedItem = i.name.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedItem === normalizedSearch;
        });
        return item ? item.id : null;
    };

    // 2. Transformación de los datos
    const rowsToInsert = rawJson.map(row => {
        return {
            ptr: row['PTR'] || null,
            helisa_cc: row['C.C HELISA'] || null,
            // Asegúrate de que estos nombres coincidan EXACTO con la cabecera del Excel
            office_id: findId(oficinas, row['OFICINA']),
            client_id: findId(clientes, row['CLIENTE']),
            unit_id: findId(unidadesNegocio, row['UNIDAD DE NEGOCIO']),
            city_id: findId(ciudades, row['CIUDAD']),
            area_id: findId(zonas, row['ZONA']),
            regional_id: findId(regionales, row['REGIONAL']),
            company_id: findId(empresas, row['EMPRESA']),
            leader_id: findId(leaders, row['LIDER']) || findId(leaders, row['LIDER1']),
            //created_at: new Date(),
            //updated_at: new Date()
        };
    });

    // 3. Carga masiva (DENTRO de la función process)
    console.log("Total filas a insertar:", rowsToInsert.length);
    console.log("Filas a insertar:", rowsToInsert);

    try {
        // Validación: No enviar si el array está vacío
        if (rowsToInsert.length === 0) {
            return { success: false, message: "No hay datos válidos para insertar" };
        }

        const result = await CostCenterModel.bulkInsert(rowsToInsert);

        return {
            totalProcessed: rowsToInsert.length,
            inserted: result.affectedRows !== undefined ? result.affectedRows : rowsToInsert.length,
            success: true
        };
    } catch (error) {
        console.error("Error en BulkInsert de Centros de Costo:", error);
        return {
            success: false,
            message: error.message
        };
    }
}; // AQUÍ termina la función process correctamente

module.exports = { process };