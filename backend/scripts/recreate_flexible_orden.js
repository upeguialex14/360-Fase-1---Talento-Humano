const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function recreateFlexibleOrden() {
    try {
        console.log('--- RECREANDO orden_contratacion desde cero (Máxima flexibilidad) ---');
        
        await pool.execute('DROP TABLE IF EXISTS orden_contratacion');
        
        const createQuery = `
            CREATE TABLE orden_contratacion (
                id VARCHAR(36) PRIMARY KEY,
                identificacion VARCHAR(255),
                nombre_apellido TEXT,
                fecha_ingreso TEXT,
                cargo TEXT,
                tipo_contrato TEXT,
                detalle TEXT,
                oficina TEXT,
                empleador TEXT,
                unidad TEXT,
                ciudad TEXT,
                zona TEXT,
                cliente TEXT,
                centro_costos TEXT,
                jefe TEXT,
                correo_jefe TEXT,
                analista_encargado TEXT,
                poligrafia TEXT,
                confirmacion_seleccion TEXT,
                anexos TEXT,
                verificacion_documentos TEXT,
                verificacion_anexos TEXT,
                observaciones TEXT,
                fecha_retiro TEXT,
                fin_prueba TEXT,
                dias_prueba TEXT,
                salario TEXT,
                arl TEXT,
                celular TEXT,
                correo_electronico TEXT,
                direccion TEXT,
                ciudad_personal TEXT,
                fecha_nacimiento TEXT,
                fecha_expedicion_cc TEXT,
                rh TEXT,
                eps TEXT,
                ccf TEXT,
                afp TEXT,
                bh TEXT,
                cuenta_bancaria TEXT,
                editado_manualmente TEXT,
                usuario_edicion TEXT,
                usuario_carga TEXT,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `;
        
        await pool.execute(createQuery);
        console.log('✅ Tabla recreada con éxito con todos los campos como TEXT/VARCHAR.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

recreateFlexibleOrden();
