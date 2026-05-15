const pool = require('../config/db');

async function setupGestionRequisiciones() {
    try {
        console.log('🚀 Iniciando creación de tablas para Gestión de Requisiciones...');

        // 1. Tabla de Historial de Requisiciones (Trazabilidad)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS requisicion_historial (
                id INT AUTO_INCREMENT PRIMARY KEY,
                requisicion_id INT NOT NULL,
                user_id INT NOT NULL,
                accion VARCHAR(100) NOT NULL,
                estado_anterior VARCHAR(50),
                estado_nuevo VARCHAR(50),
                observacion TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requisicion_id) REFERENCES requisiciones(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla "requisicion_historial" creada o ya existente.');

        // 2. Tabla de Candidatos por Requisición (Opcional pero recomendado para gestión)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS requisicion_candidatos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                requisicion_id INT NOT NULL,
                nombre_candidato VARCHAR(150) NOT NULL,
                cedula VARCHAR(20),
                telefono VARCHAR(20),
                correo VARCHAR(100),
                estado VARCHAR(50) DEFAULT 'Postulado',
                hoja_vida_path VARCHAR(255),
                resultado_entrevista TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (requisicion_id) REFERENCES requisiciones(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Tabla "requisicion_candidatos" creada o ya existente.');

        console.log('✨ Proceso de creación de tablas finalizado con éxito.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creando las tablas:', err);
        process.exit(1);
    }
}

setupGestionRequisiciones();
