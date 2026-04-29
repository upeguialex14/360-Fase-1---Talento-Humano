const pool = require('../../../config/db');
const peopleBusinessModel = require('../../../models/etl/people/peopleBusiness.model');

const process = async (rawJson) => {
    const [
        clientes,
        ciudadesTrabajo,
        contratos,
        lideres,
        cargosTitulo,
        estados,
        ordenes,
        centrosCosto,
        unidades,
        tiposPersona,
        empresas,
        areas,
    ] = await Promise.all([
        pool.execute('SELECT id, name FROM MASTER_CLIENTS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_CITIES').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_CONTRACTS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_LEADERS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_JOB_TITLES').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_STATUS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_ORDERS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_COST_CENTERS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_UNITS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_TYPE_PEOPLE').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_COMPANIES').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_AREAS').then(([rows]) => rows),
    ]);

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

    const rowsToInsert = rawJson.map(row => {
        return {
            client_id: findId(clientes, row['CLIENTE']),
            city_work_id: findId(ciudadesTrabajo, row['CIUDAD TRABAJO']),
            contract_id: findId(contratos, row['TIPO CONTRATO']),
            leader_id: findId(lideres, row['LIDER']),
            notes: row['OBSERVACIONES'] || null,
            missing_vacancy: row['VACANTE FALTANTE'] || null,
            job_title: findId(cargosTitulo, row['CARGO']),
            salary: row['SALARIO'] || null,
            status_id: findId(estados, row['ESTADO']),
            order_id: findId(ordenes, row['ORDEN']),
            cost_center_id: findId(centrosCosto, row['CENTRO DE COSTO']),
            unit_id: findId(unidades, row['UNIDAD']),
            type_people_id: findId(tiposPersona, row['TIPO PERSONA']),
            company_id: findId(empresas, row['EMPRESA']),
            area_id: findId(areas, row['AREA']),
            // Automáticos — comentados intencionalmente
            // termination_date: row['FECHA RETIRO'] || null,
            // start_date:       row['FECHA INICIO'] || null,
            // end_state:        row['FECHA FIN'] || null,
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

        const result = await peopleBusinessModel.bulkInsert(rowsToInsert);

        return {
            totalProcessed: rowsToInsert.length,
            inserted: result.affectedRows !== undefined ? result.affectedRows : rowsToInsert.length,
            success: true
        };
    } catch (error) {
        console.error("Error en BulkInsert de Información Laboral:", error);
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = { process };