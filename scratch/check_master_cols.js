const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
    let config = { DB_HOST: '127.0.0.1', DB_USER: 'root', DB_PASSWORD: 'root', DB_NAME: 'talentohumano360' };
    const tables = [
        'master_pension', 'master_compensation_box', 'master_type_blood', 'master_type_gender',
        'master_arl', 'master_eps', 'master_cities', 'master_job_titles', 'master_contracts',
        'master_client', 'master_company', 'master_area', 'master_unit', 'master_offices'
    ];
    
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
