const mysql = require('mysql2/promise');
require('dotenv').config();

async function unblock() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        await connection.query("UPDATE users SET is_locked = 0, failed_attempts = 0 WHERE login IN ('admin', 'anieto', '1107847158')");
        console.log('Usuarios desbloqueados y reajustados correctamente');
    } catch (err) {
        console.error(err.message);
    } finally {
        await connection.end();
    }
}

unblock();
