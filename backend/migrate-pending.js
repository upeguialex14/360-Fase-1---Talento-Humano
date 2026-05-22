const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const c = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    await c.execute(`
      CREATE TABLE IF NOT EXISTS pending_access_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        picture_url VARCHAR(500),
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        role_id INT DEFAULT NULL,
        reviewed_by INT DEFAULT NULL,
        reviewed_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_email_pending (email),
        FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Tabla pending_access_requests creada exitosamente.');
    await c.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
