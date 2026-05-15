const pool = require('./config/db');

async function setupTables() {
    try {
        console.log('--- Configurando Tablas de Vinculación y Documentación ---');
        
        // 1. Tabla de Vinculaciones (Datos de la Sección A)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS vinculaciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_completo VARCHAR(255) NOT NULL,
                identificacion VARCHAR(50) NOT NULL UNIQUE,
                telefono VARCHAR(50),
                correo VARCHAR(100),
                ciudad VARCHAR(100),
                direccion VARCHAR(255),
                barrio VARCHAR(100),
                estado EN_PROCESO ENUM('Pendiente', 'Revision', 'Aprobado', 'Rechazado') DEFAULT 'Pendiente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2. Tabla de Documentos Asociados
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS documentos_vinculacion (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vinculacion_id INT NOT NULL,
                codigo_documento VARCHAR(10) NOT NULL, -- Ej: B.01, C.05
                nombre_documento VARCHAR(255) NOT NULL,
                archivo_path VARCHAR(255) NOT NULL,
                archivo_nombre VARCHAR(255) NOT NULL,
                estado ENUM('Pendiente', 'Verificado', 'Rechazado') DEFAULT 'Pendiente',
                observaciones TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vinculacion_id) REFERENCES vinculaciones(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Tablas creadas con éxito.');
    } catch (err) {
        console.error('❌ Error configurando la base de datos:', err);
    } finally {
        process.exit(0);
    }
}

setupTables();
