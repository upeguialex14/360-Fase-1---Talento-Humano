const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function truncateTable() {
    try {
        await pool.query('TRUNCATE TABLE orden_contratacion');
        console.log('✅ Tabla orden_contratacion limpiada con éxito.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

truncateTable();
