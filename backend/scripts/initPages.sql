-- =========================================
-- TABLA DE PÁGINAS Y CONFIGURACIÓN DE ACCESOS
-- =========================================

USE personal;

-- =========================================
-- 1. CREAR TABLA PAGES (si no existe)
-- =========================================
CREATE TABLE IF NOT EXISTS pages (
    page_id INT AUTO_INCREMENT PRIMARY KEY,
    page_code VARCHAR(50) NOT NULL UNIQUE,
    page_name VARCHAR(100) NOT NULL,
    route VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_page_code (page_code),
    INDEX idx_route (route)
) ENGINE=InnoDB COMMENT='Páginas/módulos del sistema disponibles';

-- =========================================
-- 2. CREAR TABLA ROLE_PAGES (si no existe)
-- =========================================
CREATE TABLE IF NOT EXISTS role_pages (
    role_page_id INT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL,
    page_code VARCHAR(50) NOT NULL,
    can_view TINYINT(1) DEFAULT 0,
    can_edit TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_page (role_code, page_code),
    INDEX idx_role_code (role_code),
    INDEX idx_page_code (page_code),
    FOREIGN KEY (role_code) REFERENCES roles(role_code) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (page_code) REFERENCES pages(page_code) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Permisos de páginas asignados a roles';

-- =========================================
-- 3. INSERTAR PÁGINAS DISPONIBLES
-- =========================================
INSERT INTO pages (page_code, page_name, route, description)
VALUES 
('DASHBOARD', 'Dashboard General', '/dashboard', 'Panel de control principal del sistema'),
('EMPLEADOS', 'Gestión de Empleados', '/empleados', 'Módulo para gestionar información de empleados'),
('DEPARTAMENTOS', 'Gestión de Departamentos', '/departamentos', 'Módulo para gestionar departamentos'),
('REPORTES', 'Reportes', '/reportes', 'Módulo de generación de reportes'),
('ROLES', 'Gestión de Roles', '/roles', 'Módulo para administrar roles del sistema'),
('PERMISSIONS', 'Gestión de Permisos', '/permissions', 'Módulo para administrar permisos'),
('ROLE_PERMISSIONS', 'Asignación de Permisos a Roles', '/role-permissions', 'Módulo para asignar permisos a roles'),
('PLANTA', 'Planta de Operación', '/planta', 'Módulo de gestión de planta operativa'),
('COSTOS', 'Centro de Costos', '/costos', 'Módulo de análisis y gestión de costos'),
('USUARIOS', 'Gestión de Usuarios', '/usuarios', 'Módulo para administrar usuarios del sistema'),
('ROLE_PAGE_ACCESS', 'Accesos por Página y Rol', '/role-page-access', 'Módulo para gestionar accesos a páginas por rol'),
('ACTIVIDAD_USUARIOS', 'Actividad de Usuarios', '/user-activity', 'Módulo que muestra historial de login')
ON DUPLICATE KEY UPDATE page_name = VALUES(page_name);

-- =========================================
-- 4. ASIGNAR ACCESOS PARA ROL ADMIN (acceso total)
-- =========================================
DELETE FROM role_pages WHERE role_code = 'ADMIN';
INSERT INTO role_pages (role_code, page_code, can_view, can_edit)
SELECT 'ADMIN', page_code, 1, 1 FROM pages
ON DUPLICATE KEY UPDATE can_view = 1, can_edit = 1;

-- =========================================
-- 5. ASIGNAR ACCESOS PARA ROL OPER (limitado)
-- =========================================
DELETE FROM role_pages WHERE role_code = 'OPER';
INSERT INTO role_pages (role_code, page_code, can_view, can_edit)
VALUES 
('OPER', 'DASHBOARD', 1, 0),
('OPER', 'EMPLEADOS', 1, 0),
('OPER', 'DEPARTAMENTOS', 1, 0),
('OPER', 'REPORTES', 1, 0),
('OPER', 'PLANTA', 1, 0),
('OPER', 'COSTOS', 1, 0)
ON DUPLICATE KEY UPDATE can_view = 1, can_edit = 0;

-- =========================================
-- ✅ SCRIPT DE PÁGINAS COMPLETADO
-- =========================================
-- Tabla 'pages' creada con todos los módulos
-- Tabla 'role_pages' creada para permisos por rol
-- Rol ADMIN: acceso total (view + edit) a todas las páginas
-- Rol OPER: acceso solo lectura (view) a páginas de negocio
