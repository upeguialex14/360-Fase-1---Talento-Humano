-- ============================================================
-- TalentoHumano360 - Database Initialization Script
-- MVC Architecture - Clean Database Setup
-- ============================================================

USE personal;

-- ============================================================
-- 1. DISABLE FOREIGN KEY CHECKS (for clean setup)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 2. CREATE ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    role_code VARCHAR(50) PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3. CREATE USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role_code VARCHAR(50) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_locked TINYINT(1) DEFAULT 0,
    failed_attempts INT DEFAULT 0,
    last_login DATETIME,
    password_changed_at DATETIME,
    password_expires_at DATETIME,
    change_password_required TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_code) REFERENCES roles(role_code) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_login (login),
    INDEX idx_role_code (role_code),
    INDEX idx_is_locked (is_locked)
) ENGINE=InnoDB;

-- ============================================================
-- 4. CREATE PERMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    module_name VARCHAR(50),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_permission_code (permission_code)
) ENGINE=InnoDB;

-- ============================================================
-- 5. CREATE ROLE PERMISSIONS MAPPING
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_code VARCHAR(50) NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_code, permission_id),
    FOREIGN KEY (role_code) REFERENCES roles(role_code) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. CREATE PAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
    page_code VARCHAR(50) PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    route VARCHAR(150) NOT NULL,
    descripción VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 7. CREATE PARAMETERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    param_key VARCHAR(100) UNIQUE NOT NULL,
    param_value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 8. CREATE LOGIN LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL,
    user_id INT,
    success TINYINT(1) NOT NULL,
    failure_reason VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 9. CREATE USER LOCK HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_lock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login VARCHAR(50),
    email VARCHAR(100),
    failed_attempts INT,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlocked_at DATETIME,
    unlocked_by INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (unlocked_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 10. CREATE HISTORICAL LOGIN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_login (
    id CHAR(36) PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre_usuario VARCHAR(50),
    fecha_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_logout DATETIME,
    duracion_minutos INT,
    ip_usuario VARCHAR(45),
    navegador VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_login (fecha_login)
) ENGINE=InnoDB;

-- ============================================================
-- 11. RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 12. INSERT DEFAULT PARAMETERS
-- ============================================================
INSERT INTO parameters (param_key, param_value) VALUES
('max_login_attempts', '5'),
('dias_cambio_pwd', '30'),
('session_timeout_minutes', '60'),
('password_min_length', '8'),
('password_require_uppercase', '1'),
('password_require_numbers', '1'),
('password_require_special', '1')
ON DUPLICATE KEY UPDATE param_value = VALUES(param_value);

-- ============================================================
-- 13. INSERT DEFAULT ROLES
-- ============================================================
INSERT INTO roles (role_code, role_name, description) VALUES
('ADMIN', 'Administrador', 'Acceso total al sistema'),
('MANAGER', 'Gerente', 'Gestión de empleados y departamentos'),
('EMPLOYEE', 'Empleado', 'Acceso limitado a su información'),
('VIEWER', 'Visualizador', 'Solo lectura de reportes')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- ============================================================
-- 14. INSERT DEFAULT PERMISSIONS
-- ============================================================
INSERT INTO permissions (permission_code, permission_name, module_name) VALUES
('users_view', 'Ver Usuarios', 'users'),
('users_create', 'Crear Usuarios', 'users'),
('users_edit', 'Editar Usuarios', 'users'),
('users_delete', 'Eliminar Usuarios', 'users'),
('users_block', 'Bloquear Usuarios', 'users'),
('roles_view', 'Ver Roles', 'roles'),
('roles_manage', 'Gestionar Roles', 'roles'),
('employees_view', 'Ver Empleados', 'employees'),
('employees_edit', 'Editar Empleados', 'employees'),
('departments_view', 'Ver Departamentos', 'departments'),
('departments_edit', 'Editar Departamentos', 'departments'),
('reports_view', 'Ver Reportes', 'reports'),
('audit_logs_view', 'Ver Logs de Auditoría', 'audit')
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

-- ============================================================
-- 15. ASSIGN PERMISSIONS TO ROLES
-- ============================================================
-- Admin has all permissions
DELETE FROM role_permissions WHERE role_code = 'ADMIN';
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'ADMIN', permission_id FROM permissions;

-- Manager permissions
DELETE FROM role_permissions WHERE role_code = 'MANAGER';
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'MANAGER', permission_id FROM permissions
WHERE permission_code IN ('users_view', 'employees_view', 'employees_edit', 'departments_view', 'reports_view');

-- Employee permissions
DELETE FROM role_permissions WHERE role_code = 'EMPLOYEE';
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'EMPLOYEE', permission_id FROM permissions
WHERE permission_code IN ('employees_view', 'reports_view');

-- Viewer permissions
DELETE FROM role_permissions WHERE role_code = 'VIEWER';
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'VIEWER', permission_id FROM permissions
WHERE permission_code IN ('employees_view', 'reports_view');

-- ============================================================
-- 16. INSERT DEFAULT ADMIN USER
-- ============================================================
-- Password: Admin@123 (bcrypt hash, salt 10)
INSERT IGNORE INTO users (login, email, password_hash, full_name, role_code, is_active, password_changed_at, password_expires_at)
VALUES (
    'admin',
    'admin@talento360.com',
    '$2b$10$K9tZ8wD4F3XU1p9yQfHeNeG8fjw1v8aQyUpwB0Xc8E6jh4c0u0zG2',
    'Administrador Principal',
    'ADMIN',
    1,
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY)
);

-- ============================================================
-- ✅ DATABASE INITIALIZATION COMPLETE
-- ============================================================
-- Tables, roles, permissions, and default data created
-- Database structure is now aligned with MVC architecture
-- Application is ready for deployment
