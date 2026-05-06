const mysql = require('mysql2/promise');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'talentohumano360'
        });

        const columns = [
            'tipo_identificacion VARCHAR(50)',
            'empresa VARCHAR(100)',
            'cedula VARCHAR(20) UNIQUE',
            'apellidos_nombres VARCHAR(255)',
            'cargo VARCHAR(100)',
            'fecha_ingreso VARCHAR(50)',
            'tipo_contrato VARCHAR(100)',
            'ciudad VARCHAR(100)',
            'unidad_negocio VARCHAR(100)',
            'cliente VARCHAR(100)',
            'ceco VARCHAR(50)',
            'oficina VARCHAR(100)',
            'rh VARCHAR(10)',
            'correo_electronico VARCHAR(255)',
            'telefono VARCHAR(50)',
            'direccion VARCHAR(255)',
            'fecha_nacimiento VARCHAR(50)'
        ];

        for (const col of columns) {
            try {
                await conn.query(`ALTER TABLE people_extended_info ADD COLUMN ${col}`);
                console.log(`Columna añadida: ${col}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Columna ya existe: ${col.split(' ')[0]}`);
                } else {
                    throw err;
                }
            }
        }

        console.log('Tabla people_extended_info actualizada exitosamente');
        await conn.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
