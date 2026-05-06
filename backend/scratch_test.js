const mysql = require('mysql2/promise');
async function run() {
    const conn = await mysql.createConnection({host:'127.0.0.1', user:'root', password:'root', database:'talentohumano360'});
    try {
        await conn.execute('DELETE FROM BUSINESS_PEOPLE_DATA WHERE order_id IN (SELECT order_id FROM HIRING_ORDER WHERE user_id = "999888777")');
        await conn.execute('DELETE FROM HIRING_ORDER WHERE user_id = "999888777"');
        console.log('Deleted mock data');
    } catch(e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
run();
