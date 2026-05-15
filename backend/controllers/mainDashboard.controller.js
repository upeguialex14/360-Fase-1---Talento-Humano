const pool = require('../config/db');

/**
 * Controlador para el Dashboard Principal
 * Recopila estadísticas de todos los módulos para visualización en tiempo real
 * Diseñado para ser ultra-resistente a errores de base de datos
 */
const MainDashboardController = {
    getGlobalStats: async (req, res) => {
        // Inicializamos todo en cero
        let data = {
            empleados: { total: 0, activos: 0, inactivos: 0, empresas: 0 },
            vinculaciones: { total: 0, completados: 0, pendientes: 0 },
            requisiciones: { total: 0 },
            dotacion: { stock_total: 0, entregas_pendientes: 0 },
            planta: { total: 0 }
        };

        try {
            console.log('[MainDashboard] Iniciando recopilación segura...');

            // 1. Empleados
            try {
                const [total] = await pool.execute('SELECT COUNT(*) as total FROM people');
                data.empleados.total = total[0].total || 0;
            } catch (e) { console.warn('Dash Error (people):', e.message); }

            try {
                const [activos] = await pool.execute("SELECT COUNT(*) as total FROM business_people_data WHERE termination_date IS NULL OR termination_date = ''");
                data.empleados.activos = activos[0].total || 0;
                data.empleados.inactivos = data.empleados.total - data.empleados.activos;
            } catch (e) { console.warn('Dash Error (bpd):', e.message); }

            try {
                const [comp] = await pool.execute('SELECT COUNT(*) as total FROM master_company');
                data.empleados.empresas = comp[0].total || 0;
            } catch (e) { console.warn('Dash Error (master_company):', e.message); }

            // 2. Vinculaciones
            try {
                const [vinc] = await pool.execute(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN estado = 'Aprobado' THEN 1 ELSE 0 END) as completados,
                        SUM(CASE WHEN estado IN ('Pendiente', 'Revision') THEN 1 ELSE 0 END) as pendientes
                    FROM vinculaciones
                `);
                data.vinculaciones = {
                    total: vinc[0].total || 0,
                    completados: vinc[0].completados || 0,
                    pendientes: vinc[0].pendientes || 0
                };
            } catch (e) { console.warn('Dash Error (vinculaciones):', e.message); }

            // 3. Requisiciones
            try {
                const [reqRows] = await pool.execute('SELECT estado, COUNT(*) as cantidad FROM requisiciones GROUP BY estado');
                data.requisiciones = reqRows.reduce((acc, curr) => {
                    const key = curr.estado ? curr.estado.toLowerCase().replace(/ /g, '_') : 'sin_estado';
                    acc[key] = curr.cantidad;
                    acc.total = (acc.total || 0) + curr.cantidad;
                    return acc;
                }, { total: 0 });
            } catch (e) { console.warn('Dash Error (requisiciones):', e.message); }

            // 4. Dotación
            try {
                const [inv] = await pool.execute('SELECT SUM(quantity_available) as total FROM DOTACION_INVENTORY');
                data.dotacion.stock_total = inv[0].total || 0;
            } catch (e) { console.warn('Dash Error (dot_inv):', e.message); }

            try {
                const [del] = await pool.execute('SELECT COUNT(*) as total FROM DOTACION_DELIVERY WHERE status_id = 1');
                data.dotacion.entregas_pendientes = del[0].total || 0;
            } catch (e) { console.warn('Dash Error (dot_del):', e.message); }

            // 5. Planta
            try {
                const [planta] = await pool.execute('SELECT COUNT(*) as total FROM planta_operaciones');
                data.planta.total = planta[0].total || 0;
            } catch (e) { console.warn('Dash Error (planta):', e.message); }

            // Siempre respondemos con éxito para evitar el 500 en el Front
            return res.status(200).json({
                success: true,
                data: data
            });

        } catch (globalError) {
            console.error('[MainDashboard] Error Global Crítico:', globalError);
            // Incluso en error global, enviamos los ceros para no romper la UI
            return res.status(200).json({
                success: true,
                data: data,
                warning: 'Algunos datos no pudieron cargarse'
            });
        }
    }
};

module.exports = MainDashboardController;
