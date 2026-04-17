const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTestUser() {
    const testPassword = 'TestPassword123!';
    
    // Hash the password
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    console.log('\n🔐 Configurando usuario de prueba:');
    console.log('  Password original:', testPassword);
    console.log('  Password hash:', passwordHash);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        // Update the password for user with document_number 0000000060
        await connection.query(`
            UPDATE users 
            SET password_hash = ? 
            WHERE document_number = '0000000060'
        `, [passwordHash]);

        console.log('\n✅ Usuario actualizado con nueva contraseña');
        console.log('\n📝 Para probar el login, usa:');
        console.log(`   documento: 0000000060`);
        console.log(`   contraseña: ${testPassword}`);

        // Verify it was updated
        const [rows] = await connection.query(`
            SELECT document_number, password_hash FROM users WHERE document_number = '0000000060'
        `);
        
        if (rows.length > 0) {
            console.log('\n✅ Verificado - usuario tiene nuevo hash:');
            console.log(`   ${rows[0].password_hash}`);
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

setupTestUser();
