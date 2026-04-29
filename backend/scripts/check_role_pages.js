const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkSchema() {
    try {
        console.log('--- Describiendo tabla role_pages ---');
        const [rows] = await pool.execute('DESCRIBE role_pages');
        console.table(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
