USE personal;

CREATE TABLE IF NOT EXISTS orden_contratacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificacion VARCHAR(50) UNIQUE NOT NULL,
    nombre_apellido VARCHAR(255),
    fecha_ingreso DATE,
    cargo VARCHAR(100),
    tipo_contrato VARCHAR(100),
    detalle TEXT,
    oficina VARCHAR(100),
    empleador VARCHAR(100),
    unidad VARCHAR(100),
    ciudad VARCHAR(100),
    zona VARCHAR(100),
    cliente VARCHAR(100),
    centro_costos VARCHAR(100),
    jefe VARCHAR(100),
    correo_jefe VARCHAR(255),
    analista_encargado VARCHAR(255),
    poligrafia VARCHAR(100),
    confirmacion_seleccion VARCHAR(100),
    anexos TEXT,
    verificacion_documentos VARCHAR(100),
    verificacion_anexos VARCHAR(100),
    observaciones TEXT,
    -- Columnas Información Persona
    fecha_retiro DATE,
    fin_prueba DATE,
    dias_pruebas INT,
    salario DECIMAL(15, 2),
    arl VARCHAR(100),
    celular VARCHAR(20),
    correo_electronico VARCHAR(255),
    direccion VARCHAR(255),
    ciudad_residencia VARCHAR(100),
    fecha_nacimiento DATE,
    fecha_expedicion_cc DATE,
    rh VARCHAR(5),
    eps VARCHAR(100),
    ccf VARCHAR(100),
    afp VARCHAR(100),
    bh VARCHAR(100),
    cuenta_bancaria VARCHAR(100),
    -- Auditoría
    estado_proceso VARCHAR(50) DEFAULT 'Pendiente',
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    editado_manualmente ENUM('si', 'no') DEFAULT 'no',
    usuario_edicion VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar página en tabla pages
INSERT INTO pages (page_code, page_name, route, description)
VALUES ('ORDEN_CONTRATACION', 'Orden de Contratación', '/orden-contratacion', 'Módulo de gestión de órdenes de contratación y edición manual')
ON DUPLICATE KEY UPDATE page_name = VALUES(page_name), route = VALUES(route);

-- Asignar acceso a ADMIN
INSERT INTO role_pages (role_code, page_code, can_view, can_edit)
VALUES ('ADMIN', 'ORDEN_CONTRATACION', 1, 1)
ON DUPLICATE KEY UPDATE can_view = 1, can_edit = 1;
