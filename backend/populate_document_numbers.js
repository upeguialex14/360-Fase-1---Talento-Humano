const mysql = require('mysql2/promise');
require('dotenv').config();

async function populateDocumentNumbers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        // Usar user_id como documento (padded con zeros para que sea de 10 dígitos)
        console.log('\n🔄 Poblando document_number basado en user_id...');
        
        await connection.query(`
            UPDATE users 
            SET document_number = LPAD(user_id, 10, '0')
            WHERE document_number IS NULL
        `);

        const [result] = await connection.query('SELECT COUNT(*) as updated FROM users WHERE document_number IS NOT NULL');
        console.log(`✅ ${result[0].updated} usuarios actualizados con document_number`);

        // Mostrar algunos resultados
        const [rows] = await connection.query('SELECT user_id, document_number, email, name, last_name FROM users LIMIT 5');
        console.log('\n📋 Usuarios poblados:');
        console.log(JSON.stringify(rows, null, 2));
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

populateDocumentNumbers();
