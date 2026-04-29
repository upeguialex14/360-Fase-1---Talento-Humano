const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function checkTriggers() {
    try {
        const [rows] = await pool.execute('SHOW TRIGGERS');
        console.log('--- Triggers en la base de datos ---');
        console.table(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkTriggers();
