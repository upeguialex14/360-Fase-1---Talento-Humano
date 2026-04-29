const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function bulletproofOrdenContratacion() {
    try {
        console.log('--- Haciendo la tabla orden_contratacion A PRUEBA DE BALAS ---');
        
        const [columns] = await pool.execute('DESCRIBE orden_contratacion');
        
        for (const col of columns) {
            const name = col.Field;
            if (name === 'id' || name === 'fecha_registro' || name === 'fecha_actualizacion') continue;
            
            // Cambiar todo a TEXT para máxima flexibilidad, excepto los campos de control
            let query = `ALTER TABLE orden_contratacion MODIFY COLUMN ${name} TEXT`;
            
            // Especial para identificacion para que sea indexable (TEXT no es ideal para indexar sin prefijo)
            if (name === 'identificacion') {
                query = `ALTER TABLE orden_contratacion MODIFY COLUMN identificacion VARCHAR(255)`;
            }

            try {
                await pool.execute(query);
                console.log(`✅ ${name} ahora es flexible.`);
            } catch (err) {
                console.warn(`⚠️ No se pudo modificar ${name}: ${err.message}`);
            }
        }
        
        console.log('✅ Tabla totalmente flexibilizada.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

bulletproofOrdenContratacion();
