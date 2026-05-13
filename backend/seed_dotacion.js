require('dotenv').config();
const pool = require('./config/db');

async function seedTestData() {
    try {
        console.log('🌱 Poblando datos de prueba para Dotación...');

        // 1. Asegurar que haya items en el catálogo
        // (Ya los creamos en la migración, pero por si acaso)
        const [items] = await pool.query('SELECT item_id, item_name FROM MASTER_DOTACION_ITEM');
        
        if (items.length === 0) {
            console.log('⚠️ No hay items. Corre primero create_dotacion_tables.js');
            process.exit(1);
        }

        // 2. Poblar Inventario con stock real
        const sizes = ['S', 'M', 'L', 'XL', '38', '40', '42'];
        for (const item of items) {
            const itemSizes = item.item_name === 'Zapatos' ? ['38', '40', '42'] : ['S', 'M', 'L', 'XL'];
            for (const s of itemSizes) {
                await pool.execute(`
                    INSERT INTO DOTACION_INVENTORY (item_id, size, quantity_available, min_stock_alert)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity_available = VALUES(quantity_available)
                `, [item.item_id, s, Math.floor(Math.random() * 50) + 2, 5]);
            }
        }
        console.log('✅ Inventario poblado.');

        // 3. Crear algunas alertas de stock bajo (donde quantity < 5)
        await pool.execute(`
            INSERT INTO DOTACION_ALERT_LOG (item_id, size, quantity_at_alert, min_threshold, status)
            SELECT item_id, size, quantity_available, min_stock_alert, 'PENDIENTE'
            FROM DOTACION_INVENTORY
            WHERE quantity_available <= min_stock_alert
            LIMIT 3
        `);
        console.log('✅ Alertas de prueba creadas.');

        // 4. Registrar una entrega ficticia para ver estadísticas
        // Necesitamos al menos una persona
        const [people] = await pool.query('SELECT people_id FROM people LIMIT 1');
        if (people.length > 0) {
            const pId = people[0].people_id;
            const [delivery] = await pool.execute(`
                INSERT INTO DOTACION_DELIVERY (people_id, period_number, period_year, status_id)
                VALUES (?, 1, 2026, 4)
            `, [pId]);
            console.log('✅ Entrega de prueba registrada.');
        }

        console.log('🚀 Datos de prueba listos.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

seedTestData();
