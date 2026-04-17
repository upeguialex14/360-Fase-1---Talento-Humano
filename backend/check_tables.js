const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('Estructura de role_permissions:');
        const [rp] = await connection.query('DESCRIBE role_permissions');
        console.log(JSON.stringify(rp, null, 2));

        console.log('\nEstructura de permissions:');
        const [p] = await connection.query('DESCRIBE permissions');
        console.log(JSON.stringify(p, null, 2));

        console.log('\nEstructura de role_pages:');
        const [rpages] = await connection.query('DESCRIBE role_pages');
        console.log(JSON.stringify(rpages, null, 2));

        console.log('\nEstructura de pages:');
        const [pages] = await connection.query('DESCRIBE pages');
        console.log(JSON.stringify(pages, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkTables();
