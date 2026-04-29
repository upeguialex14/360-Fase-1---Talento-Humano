const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkMoreMasters() {
    const tables = [
        'master_client',
        'master_unit',
        'master_cities'
    ];

    try {
        for (const table of tables) {
            console.log(`--- Describiendo tabla ${table} ---`);
            const [rows] = await pool.execute(`DESCRIBE ${table}`);
            console.table(rows);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkMoreMasters();
