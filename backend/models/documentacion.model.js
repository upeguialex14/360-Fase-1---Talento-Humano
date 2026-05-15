const pool = require('../config/db');

/**
 * Modelo para la gestión de vinculaciones y documentos
 */
const DocumentacionModel = {
    // Inicializar tablas (se llama al cargar el modelo para asegurar que existan)
    init: async () => {
        try {
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
                    estado ENUM('Pendiente', 'Revision', 'Aprobado', 'Rechazado') DEFAULT 'Pendiente',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            await pool.execute(`
                CREATE TABLE IF NOT EXISTS documentos_vinculacion (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    vinculacion_id INT NOT NULL,
                    codigo_documento VARCHAR(10) NOT NULL,
                    nombre_documento VARCHAR(255) NOT NULL,
                    archivo_path VARCHAR(255) NOT NULL,
                    archivo_nombre VARCHAR(255) NOT NULL,
                    estado ENUM('Pendiente', 'Verificado', 'Rechazado') DEFAULT 'Pendiente',
                    observaciones TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (vinculacion_id) REFERENCES vinculaciones(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Tablas de vinculación verificadas.');
        } catch (err) {
            console.error('❌ Error inicializando tablas de documentación:', err);
        }
    },

    // Crear una nueva vinculación
    createVinculacion: async (data) => {
        const [result] = await pool.execute(
            'INSERT INTO vinculaciones (nombre_completo, identificacion, telefono, correo, ciudad, direccion, barrio) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.nombre_completo, data.identificacion, data.telefono, data.correo, data.ciudad, data.direccion, data.barrio]
        );
        return result.insertId;
    },

    // Guardar un documento
    addDocument: async (data) => {
        const [result] = await pool.execute(
            'INSERT INTO documentos_vinculacion (vinculacion_id, codigo_documento, nombre_documento, archivo_path, archivo_nombre) VALUES (?, ?, ?, ?, ?)',
            [data.vinculacion_id, data.codigo_documento, data.nombre_documento, data.archivo_path, data.archivo_nombre]
        );
        return result.insertId;
    },

    // Obtener todas las vinculaciones con conteo de documentos
    getAllVinculaciones: async () => {
        const [rows] = await pool.execute(`
            SELECT v.*, 
            (SELECT COUNT(*) FROM documentos_vinculacion WHERE vinculacion_id = v.id) as total_documentos,
            (SELECT COUNT(*) FROM documentos_vinculacion WHERE vinculacion_id = v.id AND estado = 'Pendiente') as pendientes
            FROM vinculaciones v 
            ORDER BY v.created_at DESC
        `);
        return rows;
    },

    // Obtener una vinculación por ID con sus datos y lista de documentos
    getVinculacionById: async (id) => {
        const [vinculacion] = await pool.execute('SELECT * FROM vinculaciones WHERE id = ?', [id]);
        if (vinculacion.length === 0) return null;

        const [documentos] = await pool.execute('SELECT * FROM documentos_vinculacion WHERE vinculacion_id = ?', [id]);
        
        return {
            ...vinculacion[0],
            documentos
        };
    },

    // Actualizar estado de un documento
    updateDocumentStatus: async (id, estado, observaciones) => {
        await pool.execute(
            'UPDATE documentos_vinculacion SET estado = ?, observaciones = ? WHERE id = ?',
            [estado, observaciones, id]
        );
    }
};

// Auto-inicializar al importar con manejo de errores para evitar cierres del servidor
(async () => {
    try {
        await DocumentacionModel.init();
    } catch (err) {
        console.error('⚠️ Error crítico en inicialización de DocumentacionModel:', err.message);
    }
})();

module.exports = DocumentacionModel;
