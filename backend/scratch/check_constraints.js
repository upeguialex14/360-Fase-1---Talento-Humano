const pool = require('../config/db');
async function check() {
    try {
        const [r1] = await pool.query('SHOW CREATE TABLE BUSINESS_PEOPLE_DATA');
        console.log('--- BUSINESS_PEOPLE_DATA ---');
        console.log(r1[0]['Create Table']);
        const [r2] = await pool.query('SHOW CREATE TABLE HIRING_ORDER');
        console.log('--- HIRING_ORDER ---');
        console.log(r2[0]['Create Table']);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
