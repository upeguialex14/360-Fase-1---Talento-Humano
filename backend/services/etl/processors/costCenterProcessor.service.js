const pool = require('../../../config/db');
const CostCenterModel = require('../../../models/etl/costCenter.model');

const process = async (rawJson) => {
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
    ]);


    // Helper encontrar ID con nombre
    const findId = (list, name) => {
        if (!name) return null;
        const item = list.find(i =>
            i.nombre && i.nombre.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === name.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        );
        return item ? item.id : null;
    };

    // Transformacion de los datos
    const rowsToInsert = rawJson.map(row => {
        return {
            //Mapeo directo desde el excel
            ptr: row['PTR'] || null,
            helisa_cc: row['C.C HELISA'] || null,

            //Mapeo desde la base de datos
            oficina_id: findId(oficinas, row['OFICINA']),
            cliente_id: findId(clientes, row['CLIENTE']),
            unidad_negocio_id: findId(unidadesNegocio, row['UNIDAD DE NEGOCIO']),
            ciudad_id: findId(ciudades, row['CIUDAD']),
            zona_id: findId(zonas, row['ZONA']),
            regional_id: findId(regionales, row['REGIONAL']),
            empresa_id: findId(empresas, row['EMPRESA']),
            lider_id: findId(lideres, row['LIDER']),
            departamento_id: findId(departamentos, row['DEPARTAMENTO']),
            status_id: 1, // Quemado según el original en caso de modificar a futuro
            created_at: new Date(),
            updated_at: new Date()
        };
    });

    // Carga masiva usando nuestra logica de inserts naticos mysql2
    try {
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
};

module.exports = { process };