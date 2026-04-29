const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function createMissingTables() {
    console.log('--- Creando tablas adicionales de logs ---');
    
    const loginLogsSql = `
        CREATE TABLE IF NOT EXISTS login_logs (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            user_id     INT NULL,
            username    VARCHAR(100) NOT NULL,
            success     TINYINT(1) NOT NULL DEFAULT 0,
            reason      VARCHAR(100) NULL,
            ip_address  VARCHAR(45) NULL,
            user_agent  VARCHAR(512) NULL,
            login_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ll_user_id   (user_id),
            INDEX idx_ll_username  (username),
            INDEX idx_ll_login_time (login_time)
        ) ENGINE=InnoDB COMMENT='Registro de intentos de login (exitosos y fallidos)';
    `;

    const historialLoginSql = `
        CREATE TABLE IF NOT EXISTS historial_login (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            user_id             INT NOT NULL,
            username            VARCHAR(100) NOT NULL,
            email               VARCHAR(255) NULL,
            ip_address          VARCHAR(45) NULL,
            user_agent          VARCHAR(512) NULL,
            login_time          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            fecha_logout        DATETIME NULL,
            duracion_minutos    INT NULL,
            INDEX idx_hl_user_id   (user_id),
            INDEX idx_hl_login_time (login_time)
        ) ENGINE=InnoDB COMMENT='Historial completo de sesiones de usuario';
    `;

    try {
        await pool.execute(loginLogsSql);
        console.log('Tabla login_logs lista.');
        await pool.execute(historialLoginSql);
        console.log('Tabla historial_login lista.');
    } catch (error) {
        console.error('Error al crear tablas de logs:', error);
    } finally {
        process.exit();
    }
}

createMissingTables();
