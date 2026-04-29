const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkCostCenters() {
    try {
        const [rows] = await pool.query('SELECT * FROM cost_center LIMIT 5');
        console.log('--- Registros en cost_center ---');
        console.log(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkCostCenters();
