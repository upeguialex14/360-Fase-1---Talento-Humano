require('dotenv').config({ path: './backend/.env' });
const pool = require('../backend/config/db.js');

async function test() {
    try {
        const tables = ['HIRING_ORDER', 'BUSINESS_PEOPLE_DATA', 'USERS', 'MASTER_CONTRACTS', 'MASTER_JOB_TITLES', 'MASTER_CLIENT', 'MASTER_CITIES', 'COST_CENTER', 'MASTER_OFFICES', 'MASTER_COMPANY', 'MASTER_AREA', 'MASTER_UNIT'];
        for (const table of tables) {
            try {
                const [rows] = await pool.query(`DESCRIBE ${table}`);
                console.log(`Table: ${table}`);
                console.log(rows.map(r => r.Field).join(', '));
            } catch (e) {
                console.log(`Table ${table} error: ${e.message}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

test();
