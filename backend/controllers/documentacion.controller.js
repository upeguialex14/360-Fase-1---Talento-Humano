const DocumentacionModel = require('../models/documentacion.model');
const path = require('path');
const fs = require('fs');

/**
 * Controlador para procesar vinculaciones y subida de archivos
 */
const DocumentacionController = {
    // Procesar envío de formulario de vinculación
    submitVinculacion: async (req, res) => {
        try {
            const data = JSON.parse(req.body.data);
            const files = req.files;

            console.log('--- Procesando Nueva Vinculación ---');
            console.log('Empleado:', data.nombreCompleto);

            // 1. Crear el registro base en la tabla vinculaciones
            const vinculacionId = await DocumentacionModel.createVinculacion({
                nombre_completo: data.nombreCompleto,
                identificacion: data.identificacion,
                telefono: data.telefono,
                correo: data.correo,
                ciudad: data.ciudad,
                direccion: data.direccion,
                barrio: data.barrio
            });

            // 2. Mapeo de códigos de documentos
            const docMapping = {
                hojaVida: { code: 'B.01', name: 'Hoja de vida' },
                actaDiploma: { code: 'B.02', name: 'Acta/Diploma' },
                cedula: { code: 'B.03', name: 'Cédula' },
                antecedentes: { code: 'B.04', name: 'Antecedentes' },
                refPersonales: { code: 'B.05', name: 'Ref. Personales' },
                refLaborales: { code: 'B.06', name: 'Ref. Laborales' },
                certBancario: { code: 'B.07', name: 'Cert. Bancario' },
                certEps: { code: 'B.08', name: 'Cert. EPS' },
                certPension: { code: 'B.09', name: 'Cert. Pensión' },
                civilHijos: { code: 'C.01', name: 'Civil Hijos' },
                tiHijos: { code: 'C.02', name: 'TI Hijos' },
                certEscolar: { code: 'C.03', name: 'Cert. Escolar' },
                cedulaPadres: { code: 'C.04', name: 'Cédula Padres' },
                registroParentesco: { code: 'C.05', name: 'Reg. Parentesco' },
                epsPadres: { code: 'C.06', name: 'EPS Padres' },
                cedulaConyuge: { code: 'C.07', name: 'Cédula Cónyuge' },
                certLaboralConyuge: { code: 'C.08', name: 'Cert. Laboral Cónyuge' },
                docVinculacion: { code: 'D.01', name: 'Docs Vinculación' },
                fotoCarnet: { code: 'E.01', name: 'Foto Carnet' }
            };

            // 3. Procesar y guardar archivos en la BD
            if (files && files.length > 0) {
                for (const file of files) {
                    const fieldName = file.fieldname;
                    const docInfo = docMapping[fieldName];

                    if (docInfo) {
                        await DocumentacionModel.addDocument({
                            vinculacion_id: vinculacionId,
                            codigo_documento: docInfo.code,
                            nombre_documento: docInfo.name,
                            archivo_path: file.path,
                            archivo_nombre: file.filename
                        });
                    }
                }
            }

            res.status(201).json({
                success: true,
                message: 'Vinculación procesada con éxito',
                id: vinculacionId
            });

        } catch (err) {
            console.error('Error procesando vinculación:', err);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al procesar la vinculación',
                error: err.message
            });
        }
    },

    // Obtener lista de vinculaciones para el panel de gestión
    getVinculaciones: async (req, res) => {
        try {
            const list = await DocumentacionModel.getAllVinculaciones();
            res.json({ success: true, data: list });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Obtener detalle de una vinculación
    getVinculacionDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const vinculacion = await DocumentacionModel.getVinculacionById(id);
            if (!vinculacion) {
                return res.status(404).json({ success: false, message: 'Vinculación no encontrada' });
            }
            res.json({ success: true, data: vinculacion });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Actualizar estado de un documento
    updateDocStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado, observaciones } = req.body;
            await DocumentacionModel.updateDocumentStatus(id, estado, observaciones);
            res.json({ success: true, message: 'Estado actualizado' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = DocumentacionController;
