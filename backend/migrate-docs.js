const pool = require('./config/db');

async function migrate() {
    try {
        console.log('--- Iniciando Migración de Documentación ---');
        
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS documentos_empleados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                empleado_id INT NOT NULL,
                tipo_documento VARCHAR(100) NOT NULL,
                nombre_archivo VARCHAR(255) NOT NULL,
                archivo_path VARCHAR(255) NOT NULL,
                size VARCHAR(50),
                fecha_vencimiento DATE,
                estado ENUM('Pendiente', 'Verificado', 'Vencido') DEFAULT 'Pendiente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabla documentos_empleados creada o ya existe.');
        
    } catch (err) {
        console.error('❌ Error en la migración:', err);
    }
}

migrate();
