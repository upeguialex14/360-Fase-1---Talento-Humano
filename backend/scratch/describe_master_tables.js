const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function inspect() {
    try {
        const [rows] = await pool.execute('SELECT * FROM roles');
        console.log('=== Roles ===');
        console.table(rows);
    } catch (error) {
        console.error('❌ Error showing roles:', error.message);
    }
    process.exit();
}

inspect();
