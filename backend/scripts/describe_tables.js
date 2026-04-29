const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function describePages() {
    try {
        const [rows] = await pool.query('DESCRIBE pages');
        console.log('--- Columnas en la tabla pages ---');
        console.log(rows);
        
        const [rows2] = await pool.query('DESCRIBE role_pages');
        console.log('--- Columnas en la tabla role_pages ---');
        console.log(rows2);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

describePages();
