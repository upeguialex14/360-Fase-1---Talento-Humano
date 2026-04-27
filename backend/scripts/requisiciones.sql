-- ============================================================
-- Tabla de Requisiciones para Gestión de Requisiciones
-- ============================================================

USE personal;

-- Crear tabla de requisiciones
CREATE TABLE IF NOT EXISTS requisiciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_req VARCHAR(20) UNIQUE NOT NULL,
    fecha_llegada DATETIME NOT NULL,
    mes VARCHAR(20),
    empresa VARCHAR(100) DEFAULT 'MULTIVAL',
    cliente VARCHAR(150),
    regional VARCHAR(100),
    unidad_negocio VARCHAR(100),
    zona VARCHAR(100),
    cargo VARCHAR(150) NOT NULL,
    cantidad INT DEFAULT 1,
    justificacion VARCHAR(100),
    detalle TEXT,
    tipo_contrato VARCHAR(50),
    estado VARCHAR(30) DEFAULT 'Recibido',
    asignado_a VARCHAR(100),
    analista_asignado_id INT,
    dias_mora INT DEFAULT 0,
    porcentaje_cumplimiento DECIMAL(5,2) DEFAULT 100.00,
    hoja_vida_path VARCHAR(255),
    aprobacion_path VARCHAR(255),
    solicitante_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (analista_asignado_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (solicitante_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_codigo_req (codigo_req),
    INDEX idx_estado (estado),
    INDEX idx_fecha_llegada (fecha_llegada),
    INDEX idx_analista_asignado (analista_asignado_id),
    INDEX idx_cargo (cargo),
    INDEX idx_cliente (cliente)
) ENGINE=InnoDB;

-- Insertar página en la tabla pages
INSERT INTO pages (page_code, page_name, route, descripción, is_active) 
VALUES ('GESTION_REQUISICIONES', 'Gestión de Requisiciones', '/gestion-requisiciones', 'Módulo de gestión de requisiciones de personal', 1)
ON DUPLICATE KEY UPDATE page_name = 'Gestión de Requisiciones';

-- Verificar que se creó correctamente
SELECT * FROM requisiciones LIMIT 1;
SELECT * FROM pages WHERE page_code = 'GESTION_REQUISICIONES';