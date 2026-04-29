const pool = require('../../../../config/db');
const peopleDetailsModel = require('../../../../models/etl/people/peopleDetails.model');

const process = async (rawJson) => {
    const [
        orientaciones,
        poblacionesEspeciales,
        etnias,
        estadosDotacion,
        tiposSangre,
        tiposVivienda,
        tiposVehiculo,
    ] = await Promise.all([
        pool.execute('SELECT id, name FROM MASTER_ORIENTATIONS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_SPECIAL_POPULATIONS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_ETHNICS').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_STATUS_ENDOWMENT').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_BLOOD_TYPES').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_HOUSING_TYPES').then(([rows]) => rows),
        pool.execute('SELECT id, name FROM MASTER_VEHICLES').then(([rows]) => rows),
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
            orientation_id: findId(orientaciones, row['ORIENTACION SEXUAL']),
            special_population_id: findId(poblacionesEspeciales, row['POBLACION ESPECIAL']),
            ethnic_id: findId(etnias, row['ETNIA']),
            stratum: row['ESTRATO'] || null,
            partner_name: row['NOMBRE PAREJA'] || null,
            neighborhood: row['BARRIO'] || null,
            address: row['DIRECCION'] || null,
            children_count: row['NUMERO HIJOS'] || 0,
            partner_id_number: row['CEDULA PAREJA'] || null,
            size_shirt: row['TALLA CAMISA'] || null,
            size_jean: row['TALLA JEAN'] || null,
            size_shoes: row['TALLA ZAPATOS'] || null,
            size_jacket: row['TALLA CHAQUETA'] || null,
            status_endowment: findId(estadosDotacion, row['ESTADO DOTACION']),
            size_vest: row['TALLA CHALECO'] || null,
            blood_id: findId(tiposSangre, row['TIPO SANGRE']),
            housing_id: findId(tiposVivienda, row['TIPO VIVIENDA']),
            vehicle_id: findId(tiposVehiculo, row['TIPO VEHICULO']),
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

        const result = await peopleDetailsModel.bulkInsert(rowsToInsert);

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
