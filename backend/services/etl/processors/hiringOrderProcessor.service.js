const pool = require('../../../config/db');
const hiringOrderModel = require('../../../models/etl/hiringOrder.model');

const process = async () => {
    const [
        status,
        offices,
        plants,
        costCenters,
        contracts,
        cities,
        clients,
        jobs
    ] = await Promise.all([
        pool.execute('SELECT status_id AS id, label AS name FROM MASTER_STATUS').then(([rows]) => rows),
        pool.execute('SELECT office_id AS id, name FROM MASTER_OFFICES').then(([rows]) => rows),
        pool.execute('SELECT cost_center_id AS id, name FROM MASTER_COST_CENTERS').then(([rows]) => rows),
        pool.execute('SELECT contract_id AS id, name FROM MASTER_CONTRACTS').then(([rows]) => rows),
        pool.execute('SELECT city_id AS id, name FROM MASTER_CITIES').then(([rows]) => rows),
        pool.execute('SELECT client_id AS id, name FROM MASTER_CLIENTS').then(([rows]) => rows),
        pool.execute('SELECT id_job AS id, name FROM MASTER_JOBS').then(([rows]) => rows),
    ]);


    // Consulta para obtener los lideres segun logica implementada desde USERS
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


    //TERMINAR DE REVISAR EXCEL
    const rowsToInsert = rawJson.map(row => {
        return {
            id_job: findId(trabajos, row['CARGO']),
            user_id: findId(usuarios, row['USUARIO']),
            detail_justification: row['JUSTIFICACION'] || null,
            polygraph_test: row['POLIGRAFO'] || 0,
            probation_days: row['DIAS_PRUEBA'] || null,
            uploaded_by: row['CARGADO_POR'] || null,
            cost_center_id: findId(centrosCosto, row['CENTRO DE COSTO']),
            plant_id: findId(plantas, row['PLANTA']),
            office_id: findId(oficinas, row['OFICINA']),
            contract_id: findId(contratos, row['TIPO CONTRATO']),
            city_id: findId(ciudades, row['CIUDAD']),
            client_id: findId(clientes, row['CLIENTE']),
            status_id: findId(estados, row['ESTADO']),
            selection_confirmed: row['CONFIRMACION SELECCION'] || null,
            selection_hiring_confirmed: row['CONFIRMACION CONTRATACION'] || null,
            lader_id: findId(liders, row['LIDER']),
            // Automáticos — comentados intencionalmente
            // created_at:              new Date(),
            // update_at:               new Date(),
            // probation_end_date:      calcular según lógica de negocio,
            // hire_date:               calcular según lógica de negocio,
            // update_by:               sesión del usuario activo,
        };
    });

    console.log("Total filas a insertar:", rowsToInsert.length);
    console.log("Filas a insertar:", rowsToInsert);

    try {
        // Validación: No enviar si el array está vacío
        if (rowsToInsert.length === 0) {
            return { success: false, message: "No hay datos válidos para insertar" };
        }

        const result = await hiringOrderModel.bulkInsert(rowsToInsert);

        return {
            totalProcessed: rowsToInsert.length,
            inserted: result.affectedRows !== undefined ? result.affectedRows : rowsToInsert.length,
            success: true
        };
    } catch (error) {
        console.error("Error en BulkInsert de Órdenes de Contratación:", error);
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = { process };


