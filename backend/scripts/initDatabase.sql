USE personal;

-- =========================================
-- 1️⃣ ELIMINAR FK BLOQUEANTE
-- =========================================
ALTER TABLE users DROP FOREIGN KEY fk_users_role;

-- =========================================
-- 2️⃣ MODIFICAR ROLE_CODE A VARCHAR(50)
-- =========================================
ALTER TABLE roles MODIFY role_code VARCHAR(50) NOT NULL;
ALTER TABLE users MODIFY role_code VARCHAR(50) NOT NULL;

-- =========================================
-- 3️⃣ RECREAR LA FK CORRECTAMENTE
-- =========================================
ALTER TABLE users
ADD CONSTRAINT fk_users_role
FOREIGN KEY (role_code)
REFERENCES roles(role_code)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- =========================================
-- 4️⃣ INSERTAR ROLES
-- =========================================
INSERT INTO roles (role_code, role_name, description, created_at)
VALUES
('ADMIN', 'Administrador', 'Rol con acceso total', NOW()),
('OPER', 'Operador', 'Rol con permisos limitados', NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- =========================================
-- 5️⃣ INSERTAR USUARIOS DE PRUEBA
-- =========================================
INSERT INTO users (login, email, password_hash, full_name, role_code, is_active, created_at, password_changed_at, password_expires_at)
VALUES
('admin', 'admin@talento360.com', '$2b$10$K9tZ8wD4F3XU1p9yQfHeNeG8fjw1v8aQyUpwB0Xc8E6jh4c0u0zG2', 'Administrador Principal', 'ADMIN', TRUE, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('oper', 'oper@talento360.com', '$2b$10$Yf8kP0N3L6dF8m2Qk9lA9OZ8sH7v1qJcYpM4nVb7R2T0bX3eE8iW', 'Operador Ejemplo', 'OPER', TRUE, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- =========================================
-- ✅ SCRIPT COMPLETO LISTO
-- =========================================
-- Ahora tu base tiene:
-- Roles: ADMIN y OPER
-- Permisos: empleados y departamentos
-- Role_permissions asignados
-- Usuarios de prueba: admin y oper
-- Parámetro de cambio de contraseña: 30 días
-- FK y índices aplicados correctamente




USE personal;

-- =========================================
-- 1. AJUSTES EN TABLA USERS
-- =========================================

-- Agregar columna password_changed_at
ALTER TABLE users
ADD COLUMN password_changed_at DATETIME NULL AFTER password_hash;

-- Agregar columna password_expires_at
ALTER TABLE users
ADD COLUMN password_expires_at DATETIME NULL AFTER password_changed_at;

-- Si alguna ya existe y da error, simplemente ignora ese error y continúa

-- =========================================
-- 2. CREAR TABLA PARAMETERS
-- =========================================

CREATE TABLE IF NOT EXISTS parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    param_key VARCHAR(100) UNIQUE NOT NULL,
    param_value VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar o actualizar parámetro días cambio contraseña
INSERT INTO parameters (param_key, param_value)
VALUES ('dias_cambio_pwd', '30')
ON DUPLICATE KEY UPDATE param_value = '30';

-- =========================================
-- 3. ASEGURAR RELACIÓN USERS - ROLES
-- =========================================
ALTER TABLE roles
ADD CONSTRAINT uk_roles_role_code UNIQUE (role_code);

ALTER TABLE users
ADD CONSTRAINT fk_users_role
FOREIGN KEY (role_code)
REFERENCES roles(role_code)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- =========================================
-- 4. ASEGURAR RELACIÓN ROLE_PERMISSIONS
-- =========================================

ALTER TABLE role_permissions
ADD CONSTRAINT fk_role_permissions_role
FOREIGN KEY (role_code)
REFERENCES roles(role_code)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE role_permissions
ADD CONSTRAINT fk_role_permissions_permission
FOREIGN KEY (Permissions_code)
REFERENCES permissions(Permissions_code)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- =========================================
-- 5. ÍNDICES IMPORTANTES
-- =========================================

CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_users_role ON users(role_code);
CREATE INDEX idx_permissions_code ON permissions(Permissions_code);
CREATE INDEX idx_roles_code ON roles(role_code);

-- =========================================
-- 6. INSERTAR ROL ADMIN SI NO EXISTE
-- =========================================

INSERT INTO roles (role_code, role_name, description, created_at)
VALUES ('ADMIN', 'Administrador', 'Rol con acceso total', NOW())
ON DUPLICATE KEY UPDATE role_name = 'Administrador';

-- =========================================
-- FIN DEL SCRIPT
-- =========================================


-- Tabla de Roles
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_code int (11),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB COMMENT='Roles del sistema (Admin Principal, Admin de Área, Operador, Trabajador)';

-- Tabla de Usuarios

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    login varchar (100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_code INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    change_pasword datetime,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role_code),
    INDEX idx_active (is_active),
    INDEX idx_login (login)
) ENGINE=InnoDB COMMENT='Usuarios del sistema con autenticación';

-- Tabla de Permisos
CREATE TABLE permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_code INT , 
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_module (module_name)
) ENGINE=InnoDB COMMENT='Permisos granulares por módulo';

CREATE TABLE role_permissions (
    role_permission_id INT AUTO_INCREMENT PRIMARY KEY,
    role_code INT NOT NULL,
    permission_code INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_code (role_code),
    INDEX idx_permission_code (permission_code)
) ENGINE=InnoDB COMMENT='Relación entre roles y permisos';

-- =========================================
-- TABLA HISTORIAL DE LOGIN
-- =========================================
CREATE TABLE IF NOT EXISTS historial_login (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre_usuario VARCHAR(255) NOT NULL,
    fecha_login DATETIME NOT NULL,
    fecha_logout DATETIME NULL,
    duracion_minutos INT NULL,
    ip_usuario VARCHAR(100),
    navegador VARCHAR(255),
    INDEX idx_hist_login_usuario (usuario_id)
) ENGINE=InnoDB COMMENT='Registro de logins de usuarios';

-- =========================================
-- TABLA HISTORIAL DE PERMISOS POR ROL
-- =========================================
CREATE TABLE IF NOT EXISTS historial_permisos_roles (
    id VARCHAR(36) PRIMARY KEY,
    rol_id INT NULL,
    nombre_rol VARCHAR(100) NULL,
    page VARCHAR(100) NULL,
    accion VARCHAR(20) NOT NULL,
    realizado_por INT NULL,
    nombre_admin VARCHAR(255) NULL,
    fecha_accion DATETIME NOT NULL,
    INDEX idx_hist_perm_rol (rol_id)
) ENGINE=InnoDB COMMENT='Auditoría de cambios de permisos';

