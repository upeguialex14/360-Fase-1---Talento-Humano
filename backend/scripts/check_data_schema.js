const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkData() {
    try {
        const [rows] = await pool.execute('SELECT identificacion FROM orden_contratacion LIMIT 5');
        console.log('--- Datos en orden_contratacion ---');
        console.table(rows);
        
        const [schema] = await pool.execute('DESCRIBE orden_contratacion');
        console.log('--- Schema actual ---');
        console.table(schema);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkData();
