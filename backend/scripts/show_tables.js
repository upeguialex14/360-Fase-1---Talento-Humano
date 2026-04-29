const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function showTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('--- Tablas en la base de datos ---');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

showTables();
