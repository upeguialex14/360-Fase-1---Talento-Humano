require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        // 1. Add page
        await db.query(`
            INSERT IGNORE INTO pages (page_code, page_name, route, description) 
            VALUES ('INTERCOMUNICADOR', 'Suri Intercomunicador', '#', 'Chat interactivo de SURI para analistas y gerentes')
        `);

        // 2. Give access to GERENTE (role_id 1) by default as requested
        // Check if role_pages table exists (based on previous conversations, it likely does)
        await db.query(`
            INSERT IGNORE INTO role_pages (role_id, page_code, can_edit)
            VALUES (1, 'INTERCOMUNICADOR', 1)
        `);

        console.log('✅ Intercomunicador registered in database');
    } catch (err) {
        console.error('❌ Error registering Intercomunicador:', err.message);
    } finally {
        process.exit();
    }
}

run();
