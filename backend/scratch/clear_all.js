const pool = require('../config/db');
async function clear() {
    try {
        console.log('Disabling FK checks...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('Deleting from BUSINESS_PEOPLE_DATA...');
        await pool.query('DELETE FROM BUSINESS_PEOPLE_DATA');
        console.log('Deleting from HIRING_ORDER...');
        await pool.query('DELETE FROM HIRING_ORDER');
        console.log('Enabling FK checks...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Done!');
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
clear();
