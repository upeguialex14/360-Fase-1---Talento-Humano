const mysql = require('mysql2/promise');

async function inspect() {
    const connection = await mysql.createConnection({
        host: '10.70.40.201',
        user: 'personal',
        password: 'Personal2030**',
        database: 'talentohumano360',
        port: 3306
    });

    const tables = ['people', 'people_details', 'business_people_data', 'people_extended_info', 'people_healt_security'];
    for (const table of tables) {
        try {
            console.log(`\n--- TABLE: ${table} ---`);
            const [rows] = await connection.execute(`DESCRIBE ${table}`);
            console.table(rows);
        } catch (error) {
            console.error(`Error inspecting ${table}:`, error.message);
        }
    }
    process.exit();
}

inspect();
