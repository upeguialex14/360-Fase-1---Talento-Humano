require('dotenv').config();
const pool = require('./config/db');

async function check() {
    try {
        const [rows] = await pool.query('DESCRIBE orden_contratacion');
        console.log('COLUMNS:', rows.map(r => r.Field));
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}
check();
