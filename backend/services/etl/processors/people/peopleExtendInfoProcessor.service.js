const pool = require('../../../config/db');
const peopleExtendInfoModel = require('../../../models/etl/people/peopleExtendInfo.model');

const process = async (rawJson) => {
    const [
        nivelesEducacion,
        titulosEducacion,
    ] = await Promise.all([
        pool.execute('SELECT id, name FROM MASTER_EDUCATION_LEVELS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_EDUCATION_TITLES').then(([rows]) => rows),
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
            ref_int_metadata: row['REF INTERNA'] || null,
            pep_metadata: row['PEP'] || null,
            name_emergency: row['NOMBRE EMERGENCIA'] || null,
            number_phone_emergency: row['TELEFONO EMERGENCIA'] || null,
            contact_relationship: row['PARENTESCO CONTACTO'] || null,
            name_relationship: row['NOMBRE PARENTESCO'] || null,
            level_education_id: findId(nivelesEducacion, row['NIVEL EDUCACION']),
            title_education_id: findId(titulosEducacion, row['TITULO']),
            // Automático — comentado intencionalmente
            // date_created: new Date(),
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

        const result = await peopleExtendInfoModel.bulkInsert(rowsToInsert);

        return {
            totalProcessed: rowsToInsert.length,
            inserted: result.affectedRows !== undefined ? result.affectedRows : rowsToInsert.length,
            success: true
        };
    } catch (error) {
        console.error("Error en BulkInsert de Información Extendida:", error);
        return {
            success: false,
            message: error.message
        };
    }
}

module.exports = { process };