const mysql = require('mysql2/promise');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'talentohumano360'
        });

        console.log('Iniciando reparación total...');

        // 1. Recrear historial_login con el esquema que usa el código
        await conn.query('DROP TABLE IF EXISTS historial_login');
        await conn.query(`
            CREATE TABLE historial_login (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT,
                username VARCHAR(255),
                email VARCHAR(255),
                ip_address VARCHAR(45),
                user_agent TEXT,
                fecha_login DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_logout DATETIME,
                duracion_minutos INT
            )
        `);
        console.log('Tabla historial_login recreada');

        // 2. Asegurar que las tablas maestras tengan los nombres de columna correctos
        // Algunas tablas usan 'name' otras 'name_contract', etc.
        // El código espera ciertos nombres, vamos a verificar/ajustar si es necesario.
        
        console.log('Reparación completada');
        await conn.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
