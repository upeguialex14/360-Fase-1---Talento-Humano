require('dotenv').config();
const pool = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE historial_login');
        console.log('Columns in historial_login:');
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });
    } catch (err) {
        console.error('Error describing table:', err.message);
    } finally {
        process.exit();
    }
}

checkSchema();
