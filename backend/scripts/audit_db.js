const mysql = require('mysql2/promise');
require('dotenv').config();

async function audit() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const results = {};

        // Struct users
        const [usersCols] = await conn.query('DESCRIBE users');
        results.users_structure = usersCols;

        // User status
        const [userRows] = await conn.query('SELECT login, failed_attempts, is_locked, change_password_required, role_code FROM users WHERE login = ?', ['741852963']);
        results.target_user = userRows[0];

        // Struct lock history
        const [lockCols] = await conn.query('DESCRIBE user_lock_history');
        results.lock_history_structure = lockCols;

        // Struct role_pages
        const [rpCols] = await conn.query('DESCRIBE role_pages');
        results.role_pages_structure = rpCols;

        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await conn.end();
    }
}

audit();
