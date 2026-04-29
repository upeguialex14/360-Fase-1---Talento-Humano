const OrdenContratacion = require('../../../models/etl/ordenContratacion.model');
const crypto = require('crypto');
const { excelDateToJS } = require('../../../helpers/excel.helper');

/**
 * Procesador ETL para Orden de Contratación
 * Sigue el mismo patrón que costCenterProcessor.
 * La tabla orden_contratacion almacena strings directos (no FKs),
 * por lo que el mapeo es columna Excel → columna DB sin resolución de maestros.
 */
const process = async (rawJson, username = 'Sistema') => {

    // Mapeo de cabeceras comunes de Excel → columnas de la tabla DB
    // Normalizado para acentos y mayúsculas
    const columnMap = {
        'identificacion': 'identificacion',
        'id': 'identificacion',
        'cedula': 'identificacion',
        'cc': 'identificacion',
        'documento': 'identificacion',
        'nombre y apellido': 'nombre_apellido',
        'nombre completo': 'nombre_apellido',
        'nombres y apellidos': 'nombre_apellido',
        'empleado': 'nombre_apellido',
        'fecha de ingreso': 'fecha_ingreso',
        'fecha ingreso': 'fecha_ingreso',
        'ingreso': 'fecha_ingreso',
        'cargo': 'cargo',
        'puesto': 'cargo',
        'tipo de contrato': 'tipo_contrato',
        'contrato': 'tipo_contrato',
        'tipo contrato': 'tipo_contrato',
        'detalle': 'detalle',
        'justificacion': 'detalle',
        'detalle la justificacion para el cubrimiento de la vacante': 'detalle',
        'oficina': 'oficina',
        'sucursal': 'oficina',
        'empleador': 'empleador',
        'empresa': 'empleador',
        'unidad': 'unidad',
        'area': 'unidad',
        'departamento': 'unidad',
        'ciudad': 'ciudad',
        'municipio': 'ciudad',
        'zona': 'zona',
        'region': 'zona',
        'cliente': 'cliente',
        'proyecto': 'cliente',
        'centro de costos': 'centro_costos',
        'centro de costo': 'centro_costos',
        'ceco': 'centro_costos',
        'jefe': 'jefe',
        'jefe inmediato': 'jefe',
        'lider': 'jefe',
        'correo jefe': 'correo_jefe',
        'correo lider': 'correo_jefe',
        'email jefe': 'correo_jefe',
        'analista': 'analista_encargado',
        'analista encargado': 'analista_encargado',
        'poligrafia': 'poligrafia',
        'confirmacion seleccion': 'confirmacion_seleccion',
        'seleccion': 'confirmacion_seleccion',
        'anexos': 'anexos',
        'documentos anexos': 'anexos',
        'verificacion documentos': 'verificacion_documentos',
        'documentos personales': 'verificacion_documentos',
        'verificacion anexos': 'verificacion_anexos',
        'observaciones': 'observaciones',
        'notas': 'observaciones',
        'fecha de retiro': 'fecha_retiro',
        'fecha retiro': 'fecha_retiro',
        'retiro': 'fecha_retiro',
        'fecha retiro fijo': 'fecha_retiro',
        'fin de prueba': 'fin_prueba',
        'fin periodo de prueba': 'fin_prueba',
        'termino prueba': 'fin_prueba',
        'dias prueba': 'dias_prueba',
        'dias periodo de prueba': 'dias_prueba',
        'dias': 'dias_prueba',
        'dias pruebas': 'dias_prueba',
        'salario': 'salario',
        'sueldo': 'salario',
        'basico': 'salario',
        'arl': 'arl',
        'celular': 'celular',
        'telefono': 'celular',
        'movil': 'celular',
        'correo electronico': 'correo_electronico',
        'email': 'correo_electronico',
        'correo': 'correo_electronico',
        'direccion': 'direccion',
        'residencia': 'direccion',
        'ciudad personal': 'ciudad_personal',
        'fecha de nacimiento': 'fecha_nacimiento',
        'nacimiento': 'fecha_nacimiento',
        'fecha expedicion cc': 'fecha_expedicion_cc',
        'expedicion': 'fecha_expedicion_cc',
        'rh': 'rh',
        'sangre': 'rh',
        'eps': 'eps',
        'ccf': 'ccf',
        'caja': 'ccf',
        'compensacion': 'ccf',
        'afp': 'afp',
        'pension': 'afp',
        'bh': 'bh',
        'cuenta bancaria': 'cuenta_bancaria',
        'banco': 'cuenta_bancaria',
        'cuenta': 'cuenta_bancaria',
    };

    // Campos tipo fecha que necesitan conversión
    const dateFields = ['fecha_ingreso', 'fecha_retiro', 'fin_prueba', 'fecha_nacimiento', 'fecha_expedicion_cc'];

    // Helper para normalizar strings (quitar acentos, minúsculas, limpiar)
    const normalize = (str) => {
        if (!str) return '';
        return str.toString().toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // 1. Detectar mapeo de cabeceras del Excel
    if (rawJson.length === 0) {
        return { success: false, message: 'El archivo Excel está vacío' };
    }

    const excelHeaders = Object.keys(rawJson[0]);
    const headerMapping = {}; // excelHeader → dbColumn

    excelHeaders.forEach(header => {
        const normalizedHeader = normalize(header);
        if (columnMap[normalizedHeader]) {
            headerMapping[header] = columnMap[normalizedHeader];
        }
    });

    // Verificar que al menos 'identificacion' está mapeada
    const hasIdentificacion = Object.values(headerMapping).includes('identificacion');
    if (!hasIdentificacion) {
        return { success: false, message: 'No se detectó la columna "Identificación" en el archivo Excel' };
    }

    // 2. Transformar cada fila del Excel
    const rowsToInsert = [];
    const skipped = [];

    for (const [index, row] of rawJson.entries()) {
        const record = {};

        // Mapear cada cabecera detectada
        for (const [excelHeader, dbColumn] of Object.entries(headerMapping)) {
            let value = row[excelHeader];

            // Limpiar valores nulos o vacíos
            if (value === undefined || value === null || value === '' || value === '-') {
                record[dbColumn] = null;
                continue;
            }

            // Convertir fechas de Excel
            if (dateFields.includes(dbColumn)) {
                value = excelDateToJS(value);
            }

            record[dbColumn] = value;
        }

        // Validar que la identificación exista
        if (!record.identificacion) {
            skipped.push({ row: index + 2, reason: 'Sin identificación' });
            continue;
        }

        // Agregar campos de auditoría
        record.id = crypto.randomUUID();
        record.usuario_carga = username;
        record.usuario_edicion = username;

        rowsToInsert.push(record);
    }

    console.log('Total filas a insertar:', rowsToInsert.length);
    console.log('Filas omitidas:', skipped.length);

    // 3. Carga masiva
    try {
        if (rowsToInsert.length === 0) {
            return { success: false, message: 'No hay datos válidos para insertar' };
        }

        const results = await OrdenContratacion.bulkInsert(rowsToInsert);

        return {
            totalProcessed: rawJson.length,
            inserted: rowsToInsert.length,
            skipped: skipped.length,
            skippedDetails: skipped,
            success: true
        };
    } catch (error) {
        console.error('Error en BulkInsert de Órdenes de Contratación:', error);
        return {
            success: false,
            message: error.message
        };
    }
};

module.exports = { process };
