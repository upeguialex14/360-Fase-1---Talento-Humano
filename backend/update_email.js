const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateEmail() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const targetEmail = 'humano360@multipagas.com';
        const userId = 60; // Alexander Nieto (Gerente)

        console.log(`\n🔄 Actualizando el correo del usuario ${userId} a '${targetEmail}'...`);
        const [result] = await connection.execute(
            'UPDATE users SET email = ? WHERE user_id = ?',
            [targetEmail, userId]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Correo actualizado con éxito!');
            
            // Mostrar los datos actualizados del usuario
            const [rows] = await connection.execute(
                'SELECT user_id, document_number, email, name, last_name, role_id FROM users WHERE user_id = ?',
                [userId]
            );
            console.log('\n👤 Datos del usuario actualizados:');
            console.log(JSON.stringify(rows[0], null, 2));
        } else {
            console.log('⚠️ No se encontró el usuario con ID 60 para actualizar.');
        }
    } catch (err) {
        console.error('❌ Error al actualizar el correo:', err.message);
    } finally {
        await connection.end();
    }
}

updateEmail();
