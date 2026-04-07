const pool = require('./config/db');

async function checkTable() {
    try {
        const [rows] = await pool.execute('DESCRIBE orden_contratacion');
        console.log('TABLE_COLUMNS:', rows.map(r => r.Field).join(','));
        process.exit(0);
    } catch (error) {
        console.error('ERROR_CHECKING_TABLE:', error.message);
        process.exit(1);
    }
}

checkTable();
