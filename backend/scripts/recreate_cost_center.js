const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function recreateCostCenter() {
    try {
        console.log('--- Recreando tabla COST_CENTER para coincidir con el Modelo ---');
        
        // Desactivar FK checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Drop existante
        await pool.execute('DROP TABLE IF EXISTS COST_CENTER');
        
        // Create new
        const createQuery = `
            CREATE TABLE COST_CENTER (
                cost_center_id INT AUTO_INCREMENT PRIMARY KEY,
                ptr INT,
                helisa_cc VARCHAR(50),
                oficina_id INT,
                cliente_id INT,
                unidad_negocio_id INT,
                ciudad_id INT,
                zona_id INT,
                regional_id INT,
                empresa_id INT,
                lider_id INT,
                departamento_id INT,
                status_id INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_ptr (ptr),
                INDEX idx_helisa (helisa_cc)
            ) ENGINE=InnoDB;
        `;
        await pool.execute(createQuery);
        console.log('✅ Tabla COST_CENTER recreada con éxito.');

        // Activar FK checks
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

recreateCostCenter();
