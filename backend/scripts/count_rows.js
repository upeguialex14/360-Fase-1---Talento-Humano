const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function countRows() {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM orden_contratacion');
        console.log('--- Conteo de filas ---');
        console.table(rows);
        
        if (rows[0].total > 0) {
            const [data] = await pool.query('SELECT * FROM orden_contratacion LIMIT 1');
            console.log('--- Ejemplo de un registro ---');
            console.log(data[0]);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

countRows();
