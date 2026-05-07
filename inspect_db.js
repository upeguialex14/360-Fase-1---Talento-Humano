const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const pool = require('./backend/config/db');

async function inspectTables() {
    const tables = ['people', 'people_details', 'business_people_data', 'people_extended_info', 'people_healt_security'];
    for (const table of tables) {
        try {
            console.log(`\n--- TABLE: ${table} ---`);
            const [rows] = await pool.execute(`SHOW CREATE TABLE ${table}`);
            console.log(rows[0]['Create Table']);
        } catch (error) {
            console.error(`Error inspecting ${table}:`, error.message);
        }
    }
    process.exit();
}

inspectTables();
