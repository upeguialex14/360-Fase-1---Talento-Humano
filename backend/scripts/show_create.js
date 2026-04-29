const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function showCreate() {
    try {
        const [rows] = await pool.execute('SHOW CREATE TABLE orden_contratacion');
        console.log(rows[0]['Create Table']);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

showCreate();
