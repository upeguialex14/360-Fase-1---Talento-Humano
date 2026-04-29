const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkMasterTables() {
    const tables = [
        'master_offices',
        'master_client',
        'master_unit',
        'master_cities',
        'master_area',
        'master_regional',
        'master_company',
        'master_leader',
        'master_departament',
        'status_master'
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

checkMasterTables();
