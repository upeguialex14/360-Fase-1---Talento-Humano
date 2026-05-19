require('dotenv').config();
const pool = require('../config/db');

async function setup() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NULL,
                is_group BOOLEAN DEFAULT FALSE,
                message TEXT,
                file_url VARCHAR(255) NULL,
                file_type VARCHAR(50) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla chat_messages creada o ya existe');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creando tabla chat_messages:', err);
        process.exit(1);
    }
}

setup();
