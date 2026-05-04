const OrdenContratacionService = require('../../services/etl/ordenContratacion.service');

/**
 * Controller para la gestión de Orden de Contratación
 */

// Upsert de registros desde carga Excel
const upsertRecords = async (req, res) => {
    try {
        const records = req.body?.records;
        const selectedColumns = req.body?.selectedColumns;
        
        console.log('[DEBUG] Recibida petición upsert. Registros:', records?.length);
        
        if (!records) {
            return res.status(400).json({ success: false, message: 'No se recibieron registros para procesar' });
        }

        const username = req.user?.login || 'Sistema';
        const result = await OrdenContratacionService.upsertRecords(records, selectedColumns, username);
        res.json(result);
    } catch (error) {
        console.error('[ERROR] Error crítico en upsertRecords:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno al procesar los registros: ' + error.message
        });
    }
};

// Obtener todos los registros para la tabla visual
const getAllRecords = async (req, res) => {
    try {
        const result = await OrdenContratacionService.getAllRecords();
        res.json(result);
    } catch (error) {
        console.error('[ERROR] Error en getAllRecords:', error);
        res.status(500).json({ success: false, message: 'Error al obtener registros: ' + error.message });
    }
};

// Actualización manual de registros (Bulk) - Soporta INSERT de nuevas filas
const bulkUpdate = async (req, res) => {
    console.log('[DEBUG] Recibida petición bulkUpdate. Filas:', req.body.modifiedRows?.length);
    const { modifiedRows } = req.body;
    const username = req.user?.login || 'Sistema';

    try {
        const result = await OrdenContratacionService.bulkUpdate(modifiedRows, username);
        res.json(result);
    } catch (error) {
        console.error('[ERROR] Error en bulkUpdate:', error);
        res.status(500).json({ success: false, message: 'Error al procesar los cambios: ' + error.message });
    }
};


const deleteAllOrdenContratacion = async (req, res) => {
    try {
        const db = require('../../config/db');
        await db.query('DELETE FROM orden_contratacion');
        return res.status(200).json({ success: true, message: 'Registros eliminados' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    upsertRecords,
    getAllRecords,
    bulkUpdate,
    deleteAllOrdenContratacion
};
