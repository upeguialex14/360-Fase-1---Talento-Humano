require('dotenv').config({ path: './backend/.env' });
const pool = require('../backend/config/db.js');

async function listAll() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        console.log('--- TABLAS EN LA BASE DE DATOS ---');
        console.log(JSON.stringify(tables, null, 2));
    } catch (e) {
        console.log('Error listing tables:', e.message);
    }
    process.exit(0);
}
listAll();
