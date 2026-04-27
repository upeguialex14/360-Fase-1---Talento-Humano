const bd = require('../../config/db')
const peopleModel = require('../../../models/etl/people.model')

const process = async (rawJson) => {
    const [
        type_document,
        gender_id,
        details,
        city_housing,
        city_birth,
        business,
        departament
    ] = await Promise.all([
        pool.execute('SELECT id AS id, name FROM MASTER_TYPES').then(([rows]) => rows),
        pool.execute('SELECT id AS id, name FROM MASTER_GENDERS').then(([rows]) => rows),
        pool.execute('SELECT id AS id, description AS name FROM MASTER_DETAILS').then(([rows]) => rows),
        pool.execute('SELECT id AS id, name FROM MASTER_CITIES WHERE type = "housing"').then(([rows]) => rows),
        pool.execute('SELECT id AS id, name FROM MASTER_CITIES WHERE type = "birth"').then(([rows]) => rows),
        pool.execute('SELECT id AS id, name FROM MASTER_BUSINESS').then(([rows]) => rows),
        pool.execute('SELECT id AS id, name FROM MASTER_DEPARTAMENTS').then(([rows]) => rows),
    ]);
}


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

//REALIZAR TRANSFORMACION DE DATOS

const rowsToInsert = rawJson.map(row => {
    return {
        type_id: findId(tipos, row['TIPO DOCUMENTO']),
        document_number: row['NUMERO DOCUMENTO'] || null,
        first_name: row['NOMBRES'] || null,
        last_name: row['APELLIDOS'] || null,
        email: row['CORREO'] || null,
        birthdate: row['FECHA NACIMIENTO'] || null,
        phone_number: row['TELEFONO'] || null,
        gender_id: findId(generos, row['GENERO']),
        details_id: findId(detalles, row['DETALLE']),
        housing_city_id: findId(ciudades, row['CIUDAD RESIDENCIA']),
        city_births_id: findId(ciudades, row['CIUDAD NACIMIENTO']),
        people_business_id: findId(empresas, row['EMPRESA']),
        departament_id: findId(departamentos, row['DEPARTAMENTO']),
        // Automáticos — comentados intencionalmente
        // registration_date: new Date(),
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

// AQUÍ termina la función process correctamente

module.exports = { process };