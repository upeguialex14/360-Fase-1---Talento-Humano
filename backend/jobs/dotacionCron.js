/**
 * Cron Job para el Módulo de Dotación
 * Ejecuta tareas automáticas periódicas.
 */
const cron = require('node-cron');
const DotacionAlertService = require('../services/dotacion/dotacionAlert.service');

/**
 * Tarea: Escaneo de Inventario para Alertas
 * Frecuencia: Cada 30 minutos
 */
const startStockAlertJob = () => {
    // '*/30 * * * *' -> Cada 30 minutos
    cron.schedule('*/30 * * * *', async () => {
        try {
            await DotacionAlertService.scanInventoryAndGenerateAlerts();
        } catch (error) {
            console.error('[CRON][DOTACION] Error en job de alertas de stock:', error);
        }
    });
    
    console.log('⏰ Job de alertas de dotación iniciado (cada 30 min)');
};

module.exports = {
    startStockAlertJob
};
