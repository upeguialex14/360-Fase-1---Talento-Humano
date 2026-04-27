-- ============================================================
-- TalentoHumano360 - Crear tablas de logs faltantes
-- Ejecutar en la base de datos: talentohumano360
-- ============================================================

USE talentohumano360;

-- ============================================================
-- TABLA: login_logs
-- Usada por: backend/models/loginLog.model.js
-- Columnas requeridas: user_id, username, success, reason,
--                      ip_address, user_agent, login_time
-- ============================================================
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

-- ============================================================
-- TABLA: historial_login
-- Usada por: backend/models/historicalLogin.model.js
-- Columnas requeridas: user_id, username, email, ip_address,
--                      user_agent, login_time
-- ============================================================
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

-- ============================================================
-- ✅ Listo. Tablas creadas correctamente.
-- ============================================================
