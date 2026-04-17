const mysql = require('mysql2/promise');
require('dotenv').config();

async function getUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [rows] = await connection.query('SELECT user_id, document_number, email, name, last_name FROM users LIMIT 5');
        console.log('\n📋 Usuarios en la base de datos:');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

getUsers();
