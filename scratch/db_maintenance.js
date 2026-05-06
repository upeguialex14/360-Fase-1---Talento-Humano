const mysql = require('mysql2/promise');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'talentohumano360'
        });

        console.log('Iniciando mantenimiento de DB...');

        // 1. Ampliar teléfono a lo máximo razonable
        await conn.query('ALTER TABLE people MODIFY COLUMN phone_number VARCHAR(255)');
        console.log('phone_number ampliado a 255');

        // 2. Crear historial_login si falta
        await conn.query(`
            CREATE TABLE IF NOT EXISTS historial_login (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                fecha_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                dispositivo TEXT,
                FOREIGN KEY (usuario_id) REFERENCES users(user_id)
            )
        `);
        console.log('Tabla historial_login asegurada');

        console.log('Mantenimiento completado con éxito');
        await conn.end();
    } catch (err) {
        console.error('Error durante el mantenimiento:', err);
        process.exit(1);
    }
}

run();
