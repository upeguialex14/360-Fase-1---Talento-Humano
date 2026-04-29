const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function adjustOrdenContratacion() {
    try {
        console.log('--- Ajustando tabla orden_contratacion ---');
        
        // Aumentar tamaño de identificación y otros campos de texto
        // Y asegurar que los campos numéricos sean compatibles con lo que venga del excel (o cambiarlos a varchar si es necesario por flexibilidad)
        
        const queries = [
            'ALTER TABLE orden_contratacion MODIFY COLUMN identificacion VARCHAR(100)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN nombre_apellido VARCHAR(255)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN cargo VARCHAR(200)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN empleador VARCHAR(200)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN oficina VARCHAR(200)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN unidad VARCHAR(200)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN cliente VARCHAR(200)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN centro_costos VARCHAR(200)',
            'ALTER TABLE orden_contratacion MODIFY COLUMN jefe VARCHAR(200)',
            // Si salario o dias_prueba están recibiendo texto por error en el mapeo, 
            // podemos cambiarlos a VARCHAR temporalmente para evitar el crash 500, 
            // pero es mejor limpiar en el service.
            // No obstante, aumentaremos la robustez de los tipos.
        ];

        for (const q of queries) {
            try {
                await pool.execute(q);
                console.log(`✅ Ejecutado: ${q}`);
            } catch (err) {
                console.warn(`⚠️ Error en: ${q} - ${err.message}`);
            }
        }
        
        console.log('✅ Ajustes de tabla completados.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

adjustOrdenContratacion();
