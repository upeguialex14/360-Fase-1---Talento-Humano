const pool = require('../config/db');

async function setupSolicitudVacantes() {
    try {
        console.log('🚀 Iniciando creación de tablas para Solicitud de Vacantes...');

        // 1. Tabla de Solicitud de Vacantes
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS solicitud_vacantes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo_solicitud VARCHAR(20) UNIQUE NOT NULL,
                solicitante_id INT NOT NULL,
                empresa VARCHAR(100),
                cliente VARCHAR(100),
                regional VARCHAR(100),
                unidad_negocio VARCHAR(100),
                zona VARCHAR(100),
                cargo VARCHAR(150) NOT NULL,
                cantidad INT DEFAULT 1,
                ciudad VARCHAR(100),
                oficina VARCHAR(100),
                justificacion TEXT,
                detalle TEXT,
                tipo_contrato VARCHAR(50),
                salario_presupuestado DECIMAL(15, 2),
                estado ENUM('Borrador', 'Enviado', 'Aprobado', 'Rechazado') DEFAULT 'Borrador',
                hoja_vida_path VARCHAR(255),
                aprobacion_path VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (solicitante_id) REFERENCES users(user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla "solicitud_vacantes" creada o ya existente.');

        // 2. Tabla de Historial de Solicitudes
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS solicitud_vacante_historial (
                id INT AUTO_INCREMENT PRIMARY KEY,
                solicitud_id INT NOT NULL,
                user_id INT NOT NULL,
                accion VARCHAR(50) NOT NULL,
                observacion TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (solicitud_id) REFERENCES solicitud_vacantes(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla "solicitud_vacante_historial" creada o ya existente.');

        // 3. También asegurar que exista la tabla de requisiciones (si no existe)
        // Ya que el usuario mencionó que se enviarán allí.
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS requisiciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo_req VARCHAR(20) UNIQUE NOT NULL,
                solicitud_id INT,
                solicitante_id INT,
                fecha_llegada DATETIME DEFAULT CURRENT_TIMESTAMP,
                mes VARCHAR(20),
                empresa VARCHAR(100),
                cliente VARCHAR(100),
                regional VARCHAR(100),
                unidad_negocio VARCHAR(100),
                zona VARCHAR(100),
                cargo VARCHAR(150),
                cantidad INT,
                ciudad VARCHAR(100),
                oficina VARCHAR(100),
                justificacion TEXT,
                detalle TEXT,
                tipo_contrato VARCHAR(50),
                estado VARCHAR(50) DEFAULT 'Recibido',
                asignado_a VARCHAR(100),
                analista_asignado_id INT,
                dias_mora INT DEFAULT 0,
                porcentaje_cumplimiento INT DEFAULT 0,
                hoja_vida_path VARCHAR(255),
                aprobacion_path VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (solicitante_id) REFERENCES users(user_id),
                FOREIGN KEY (analista_asignado_id) REFERENCES users(user_id),
                FOREIGN KEY (solicitud_id) REFERENCES solicitud_vacantes(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla "requisiciones" asegurada.');

        console.log('✨ Proceso de creación de tablas finalizado con éxito.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creando las tablas:', err);
        process.exit(1);
    }
}

setupSolicitudVacantes();
