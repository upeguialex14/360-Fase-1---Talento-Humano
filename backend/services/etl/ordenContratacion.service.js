/**
 * Servicio de Orden de Contratación
 * Handles business logic for orden_contratacion operations
 */
const OrdenContratacion = require('../../models/etl/ordenContratacion.model.js');
const crypto = require('crypto');
const { excelDateToJS } = require('../../helpers/excel.helper');

const OrdenContratacionService = {
    async upsertRecords(records, selectedColumns, username) {
        if (!records || !Array.isArray(records)) {
            throw new Error('Datos inválidos');
        }

        const validColumns = [
            'identificacion', 'nombre_apellido', 'cargo', 'empleador', 'ciudad',
            'zona', 'fecha_ingreso', 'salario', 'estado_proceso', 'arl', 'tipo_contrato',
            'detalle', 'oficina', 'unidad', 'cliente', 'centro_costos', 'jefe', 'correo_jefe',
            'analista_encargado', 'poligrafia', 'confirmacion_seleccion', 'anexos',
            'verificacion_documentos', 'verificacion_anexos', 'observaciones', 'fecha_retiro',
            'fin_prueba', 'dias_prueba', 'celular', 'correo_electronico', 'direccion',
            'ciudad_personal', 'fecha_nacimiento', 'fecha_expedicion_cc', 'rh', 'eps',
            'ccf', 'afp', 'bh', 'cuenta_bancaria'
        ];

        const dateFields = ['fecha_ingreso', 'fecha_retiro', 'fin_prueba', 'fecha_nacimiento', 'fecha_expedicion_cc'];

        for (const record of records) {
            const identificacion = record.identificacion;
            if (!identificacion) continue;

            // Filter record to valid columns and convert dates
            const cleanRecord = {};
            for (const col of validColumns) {
                if (record[col] !== undefined && record[col] !== null) {
                    let val = record[col];
                    // Convert date if applicable
                    if (dateFields.includes(col)) {
                        val = excelDateToJS(val);
                    }
                    cleanRecord[col] = val;
                }
            }

            // Check if record exists
            const existing = await OrdenContratacion.findByIdentificacion(identificacion);

            if (!existing) {
                // INSERT
                const newId = crypto.randomUUID();
                console.log(`[DEBUG] Insertando nuevo registro: ${identificacion}, id: ${newId}`);

                await OrdenContratacion.insert({
                    id: newId,
                    identificacion,
                    usuario_carga: username,
                    usuario_edicion: username,
                    ...cleanRecord
                });
            } else {
                // UPDATE: Only selected columns
                const updates = {};
                for (const col of selectedColumns) {
                    if (validColumns.includes(col) && cleanRecord[col] !== undefined) {
                        updates[col] = cleanRecord[col];
                    }
                }

                if (Object.keys(updates).length > 0) {
                    updates.editado_manualmente = 'no';
                    await OrdenContratacion.updateByIdentificacion(identificacion, updates, username);
                }
            }
        }

        return { success: true, message: 'Procesamiento de registros completado' };
    },

    async getAllRecords() {
        console.log('[DEBUG] Consultando todos los registros de orden_contratacion');
        const records = await OrdenContratacion.getAll();
        return { success: true, data: records };
    },

    async bulkUpdate(modifiedRows, username) {
        console.log('[DEBUG] Procesando bulkUpdate. Filas:', modifiedRows?.length);

        if (!modifiedRows || !Array.isArray(modifiedRows)) {
            throw new Error('No hay filas para actualizar');
        }

        const editableColumns = [
            'identificacion', 'nombre_apellido', 'cargo', 'empleador', 'ciudad',
            'zona', 'fecha_ingreso', 'salario', 'estado_proceso', 'arl', 'tipo_contrato',
            'detalle', 'oficina', 'unidad', 'cliente', 'centro_costos', 'jefe', 'correo_jefe',
            'analista_encargado', 'poligrafia', 'confirmacion_seleccion', 'anexos',
            'verificacion_documentos', 'verificacion_anexos', 'observaciones', 'fecha_retiro',
            'fin_prueba', 'dias_prueba', 'celular', 'correo_electronico', 'direccion',
            'ciudad_personal', 'fecha_nacimiento', 'fecha_expedicion_cc', 'rh', 'eps',
            'ccf', 'afp', 'bh', 'cuenta_bancaria'
        ];

        for (const row of modifiedRows) {
            const { id, identificacion, ...updates } = row;
            if (!identificacion) continue;

            // Check if it's a new row
            const isNew = row.isNew || !id || id.toString().length < 10;

            if (isNew) {
                // Check for duplicate identification
                const existing = await OrdenContratacion.findByIdentificacion(identificacion);
                if (existing) {
                    console.log(`[DEBUG] Ignorando insert manual: Identificación ${identificacion} ya existe.`);
                    continue;
                }

                // Prepare data for insert
                const insertData = {
                    id: crypto.randomUUID(),
                    identificacion,
                    usuario_carga: username,
                    usuario_edicion: username,
                    editado_manualmente: 'si',
                    fecha_registro: new Date(),
                    fecha_actualizacion: new Date()
                };

                // Add editable columns
                for (const col of editableColumns) {
                    if (col !== 'identificacion' && updates[col] !== undefined) {
                        insertData[col] = updates[col];
                    }
                }

                await OrdenContratacion.insert(insertData);
                console.log(`[DEBUG] Insertada nueva fila manual: ${identificacion}`);
            } else {
                // UPDATE
                const updateData = {};
                for (const [key, value] of Object.entries(updates)) {
                    if (editableColumns.includes(key) && key !== 'identificacion') {
                        updateData[key] = value;
                    }
                }

                if (Object.keys(updateData).length > 0) {
                    updateData.fecha_actualizacion = new Date();
                    updateData.editado_manualmente = 'si';
                    updateData.usuario_edicion = username;

                    await OrdenContratacion.updateByIdentificacion(identificacion, updateData, username);
                }
            }
        }

        return { success: true, message: 'Cambios guardados correctamente' };
    }
};

module.exports = OrdenContratacionService;