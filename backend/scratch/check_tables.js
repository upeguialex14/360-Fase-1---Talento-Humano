require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/config/db');

async function checkTables() {
    try {
        const [rows] = await pool.execute('SHOW TABLES');
        console.log('Tables in database:');
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTables();
