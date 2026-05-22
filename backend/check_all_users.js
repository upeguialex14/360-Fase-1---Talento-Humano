const mysql = require('mysql2/promise');
require('dotenv').config();

async function getAllUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [rows] = await connection.query('SELECT user_id, document_number, email, name, last_name, role_id, status_id FROM users');
        console.log('\n📋 Todos los usuarios en la base de datos:');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

getAllUsers();
