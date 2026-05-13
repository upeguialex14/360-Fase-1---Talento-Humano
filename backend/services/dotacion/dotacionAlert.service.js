/**
 * Servicio de Alertas de Dotación
 * Gestiona el escaneo periódico de inventario para detectar stock bajo.
 */
const DotacionInventory = require('../../models/dotacion/dotacionInventory.model');
const DotacionAlertConfig = require('../../models/dotacion/dotacionAlertConfig.model');
const DotacionAlertLog = require('../../models/dotacion/dotacionAlertLog.model');

const DotacionAlertService = {

    /**
     * Escanea todo el inventario y genera alertas para los items bajo el umbral.
     * Este método es llamado por el Cron Job.
     */
    async scanInventoryAndGenerateAlerts() {
        console.log('[DOTACION] Iniciando escaneo de inventario para alertas...');
        
        // 1. Obtener todo el inventario con stock disponible
        const inventory = await DotacionInventory.getAll();
        
        // 2. Obtener configuraciones de alertas
        const configs = await DotacionAlertConfig.getAll();
        const configMap = configs.reduce((acc, c) => {
            acc[c.article_id] = c.min_quantity;
            return acc;
        }, {});

        let alertsGenerated = 0;

        // 3. Evaluar cada item
        for (const item of inventory) {
            const threshold = configMap[item.item_id] || 5; // Default 5
            
            if (item.quantity_available <= threshold) {
                // Verificar si ya existe alerta pendiente
                const pending = await DotacionAlertLog.getPendingAlerts();
                const alreadyAlerted = pending.find(p => p.item_id === item.item_id && p.size === item.size);

                if (!alreadyAlerted) {
                    await DotacionAlertLog.create({
                        item_id: item.item_id,
                        size: item.size,
                        quantity_at_alert: item.quantity_available,
                        min_threshold: threshold
                    });
                    alertsGenerated++;
                }
            }
        }

        console.log(`[DOTACION] Escaneo finalizado. Alertas generadas: ${alertsGenerated}`);
        return alertsGenerated;
    },

    /**
     * Obtiene el historial de alertas
     */
    async getAlertLogs(limit) {
        return await DotacionAlertLog.getAll(limit);
    },

    /**
     * Marca una alerta como gestionada (VISTO, SOLUCIONADO, etc)
     */
    async resolveAlert(logId, status = 'GESTIONADO') {
        return await DotacionAlertLog.updateStatus(logId, status);
    }
};

module.exports = DotacionAlertService;
