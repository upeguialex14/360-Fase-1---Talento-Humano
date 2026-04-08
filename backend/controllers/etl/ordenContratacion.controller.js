const OrdenContratacionService = require('../../services/etl/ordenContratacion.service');

/**
 * Controller para la gestión de Orden de Contratación
 */

// Upsert de registros desde carga Excel
const upsertRecords = async (req, res) => {
    console.log('[DEBUG] Recibida petición upsert. Registros:', req.body.records?.length);
    const { records, selectedColumns } = req.body;

    // El middleware inyecta req.user
    const username = req.user?.login || 'Sistema';

    try {
        const result = await OrdenContratacionService.upsertRecords(records, selectedColumns, username);
        res.json(result);
    } catch (error) {
        console.error('[ERROR] Error en upsertRecords:', error);
        res.status(500).json({ success: false, message: 'Error interno al procesar los registros: ' + error.message });
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


module.exports = {
    upsertRecords,
    getAllRecords,
    bulkUpdate
};
