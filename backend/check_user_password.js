const mysql = require('mysql2/promise');
require('dotenv').config();

async function getPasswordHash() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [rows] = await connection.query(`
            SELECT user_id, document_number, email, name, password_hash 
            FROM users 
            WHERE document_number = '0000000060'
        `);
        
        if (rows.length > 0) {
            const user = rows[0];
            console.log('\n👤 Usuario encontrado:');
            console.log('  user_id:', user.user_id);
            console.log('  document_number:', user.document_number);
            console.log('  name:', user.name);
            console.log('  email:', user.email);
            console.log('  password_hash:', user.password_hash);
            console.log('\n💡 Ahora puedes probar el login con este usuario.');
        } else {
            console.log('❌ Usuario no encontrado');
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

getPasswordHash();
