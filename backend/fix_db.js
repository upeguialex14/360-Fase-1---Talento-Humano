require('dotenv').config({ path: './backend/.env' });
const pool = require('./config/db');

async function fix() {
    try {
        await pool.execute('ALTER TABLE orden_contratacion ADD COLUMN estado_proceso TEXT AFTER salario');
        console.log('✅ Columna estado_proceso añadida con éxito.');
    } catch (err) {
        if (err.message.includes('Duplicate column name')) {
            console.log('ℹ️ La columna estado_proceso ya existe.');
        } else {
            console.error('❌ Error al añadir columna:', err.message);
        }
    } finally {
        process.exit(0);
    }
}
fix();
