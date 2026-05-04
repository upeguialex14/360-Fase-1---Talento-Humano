require('dotenv').config({ path: './backend/.env' });
const pool = require('../backend/config/db.js');

async function test() {
    try {
        console.log('DB_NAME:', process.env.DB_NAME);
        const [rows] = await pool.query('SELECT * FROM HIRING_ORDER LIMIT 1');
        console.log('Sample row:', rows[0]);
        console.log('Keys:', rows[0] ? Object.keys(rows[0]) : 'No rows');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

test();
