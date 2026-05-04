const pool = require('../../../config/db');
const peopleHealtSecurityModel = require('../../../models/etl/people/peopleHealtSecurity.model');

const process = async (rawJson) => {
    const [
        eps,
        pensiones,
        cajasCompensacion,
        condicionesMedicas,
        arls,
    ] = await Promise.all([
        pool.execute('SELECT id, name FROM MASTER_EPS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_PENSIONS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_COMPENSATION_BOXES').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_MEDICAL_CONDITIONS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_ARL').then(([rows]) => rows),
    ]);


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

    const rowsToInsert = rawJson.map(row => {
        return {
            people_id: findId(personas, row['DOCUMENTO']),
            eps_id: findId(eps, row['EPS']),
            pension_id: findId(pensiones, row['PENSION']),
            compensation_box_id: findId(cajasCompensacion, row['CAJA COMPENSACION']),
            medical_conditions_id: findId(condicionesMedicas, row['CONDICION MEDICA']),
            bank_account: row['CUENTA BANCARIA'] || null,
            other_medical_conditions: row['OTRAS CONDICIONES MEDICAS'] || null,
            data_processing_authorization: row['AUTORIZACION DATOS'] || 0,
            compensation_family_box: findId(cajasCompensacion, row['CAJA FAMILIAR']),
            housing_allowance: row['SUBSIDIO VIVIENDA'] || 0,
            arl_id: findId(arls, row['ARL']),
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

        const result = await peopleHealtSecurityModel.bulkInsert(rowsToInsert);

        return {
            totalProcessed: rowsToInsert.length,
            inserted: result.affectedRows !== undefined ? result.affectedRows : rowsToInsert.length,
            success: true
        };
    } catch (error) {
        console.error("Error en BulkInsert de Información de Salud y Seguridad Social:", error);
        return {
            success: false,
            message: error.message
        };
    }

}

module.exports = { process };
