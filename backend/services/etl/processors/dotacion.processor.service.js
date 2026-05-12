const pool = require('../../../config/db');
const DotacionModel = require('../../../models/etl/dotacion.model');

const process = async (rawJson) => {
    // 1. Precarga de Maestros para cruzar nombres por IDs
    const [companias, unidades, oficinas, cecos, estados, clientes] = await Promise.all([
        pool.execute('SELECT company_id as id, name as nombre FROM master_company').then(([rows]) => rows),
        pool.execute('SELECT unit_id as id, name as nombre FROM master_unit').then(([rows]) => rows),
        pool.execute('SELECT office_id as id, name as nombre FROM master_offices').then(([rows]) => rows),
        pool.execute('SELECT cost_center_id as id, ptr as nombre FROM cost_center').then(([rows]) => rows),
        pool.execute('SELECT status_id as id, status as nombre FROM status_master').then(([rows]) => rows),
        pool.execute('SELECT client_id as id, name as nombre FROM master_client').then(([rows]) => rows)
    ]);


    // Helper para normalizar y buscar IDs (igual a tu ejemplo)
    const findId = (list, name) => {
        if (!name || name === '-' || name === 'null' || name === '') return null;
        const normalizedSearch = name.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const item = list.find(i => {
            if (!i.nombre) return false;
            const normalizedItem = i.nombre.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalizedItem === normalizedSearch;
        });
        return item ? item.id : null;
    };

    // 2. Transformación: Mapeo de las columnas del Excel (Imagen d3dbbd)
    const rowsToInsert = rawJson.map(row => {
        return {
            cedula: row['CEDULA'] || null,
            full_name: row['APELLIDOS Y NOMBRES'] || null,
            hire_date: row['FECHA DE INGRESO'] ? new Date(row['FECHA DE INGRESO']) : null,
            gender: row['GENERO'] || null,
            // Lectura de tallas específicas
            t_camisa: row['T. CAMISA'] || 'N/A',
            t_pantalon: row['T. PANTALON'] || 'N/A',
            t_zapatos: row['T. ZAPATOS'] || 'N/A',
            t_chaqueta: row['T. CHAQUETA'] || 'N/A',
            t_chaleco: row['T. CHALECO'] || 'N/A',
            // Cruce con maestros
            company_id: findId(companias, row['EMPRESA']),
            unit_id: findId(unidades, row['UNIDAD DE NEGOCIO']),
            client_id: findId(clientes, row['CLIENTE']),
            office_id: findId(oficinas, row['OFICINA']),
            ceco_id: findId(cecos, row['CECO']),
            status_id: findId(estados, row['ESTADO EN LA COMPAÑIA']) || 1
        };

    }).filter(r => r.cedula !== null); // Limpiamos filas vacías

    console.log("Filas procesadas para personal:", rowsToInsert.length);

    try {
        if (rowsToInsert.length === 0) return { success: false, message: "Sin datos válidos" };

        const result = await DotacionModel.bulkInsert(rowsToInsert);

        return {
            totalProcessed: rowsToInsert.length,
            inserted: result.affectedRows,
            success: true
        };
    } catch (error) {
        console.error("Error en Procesador de Dotación:", error);
        return { success: false, message: error.message };
    }
};

module.exports = { process };