require('dotenv').config({ path: './backend/.env' });
const pool = require('../backend/config/db.js');

async function check() {
    const tables = [
        'PEOPLE', 'PEOPLE_DETAILS', 'PEOPLE_HEALT_SECURITY', 
        'MASTER_EPS', 'MASTER_AFP', 'MASTER_ARL', 'MASTER_CCF', 'MASTER_RH'
    ];
    for (const t of tables) {
        try {
            const [rows] = await pool.query(`DESCRIBE ${t}`);
            console.log(`Table: ${t}`);
            console.log(rows.map(r => `${r.Field} (${r.Type})`).join(', '));
        } catch (e) { console.log(`Error ${t}: ${e.message}`); }
    }
    process.exit(0);
}
check();
