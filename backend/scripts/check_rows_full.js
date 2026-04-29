const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkRows() {
    try {
        const [rows] = await pool.query('SELECT * FROM orden_contratacion LIMIT 5');
        console.log('--- Registros en orden_contratacion ---');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkRows();
