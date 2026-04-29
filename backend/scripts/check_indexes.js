const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkIndexes() {
    try {
        const [rows] = await pool.execute('SHOW INDEX FROM orden_contratacion');
        console.log('--- Índices en orden_contratacion ---');
        console.table(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkIndexes();
