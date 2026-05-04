const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
    let config = { DB_HOST: '127.0.0.1', DB_USER: 'root', DB_PASSWORD: 'root', DB_NAME: 'talentohumano360' };
    const tables = ['people', 'people_details', 'people_healt_security'];
    
    const connection = await mysql.createConnection({
        host: config.DB_HOST, user: config.DB_USER, password: config.DB_PASSWORD, database: config.DB_NAME
    });

    for (const t of tables) {
        try {
            const [cols] = await connection.query(`DESCRIBE ${t}`);
            console.log(`Table: ${t}`);
            console.log(cols.map(c => `${c.Field} (${c.Type})`).join(', '));
        } catch (e) { console.log(`Error ${t}: ${e.message}`); }
    }
    process.exit(0);
}
run();
