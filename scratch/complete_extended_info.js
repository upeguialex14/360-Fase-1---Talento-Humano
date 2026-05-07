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
            'fecha_vencimiento VARCHAR(50)', 'sueldo_2026 VARCHAR(50)', 'auxilio_alimentacion VARCHAR(50)',
            'auxilio_adicional_transporte VARCHAR(50)', 'bonificacion VARCHAR(50)', 'auxilio_rodamientos_1q VARCHAR(50)',
            'auxilio_rodamientos_2q VARCHAR(50)', 'auxilio_trans_extralegal VARCHAR(50)', 'auxilio_conectividad VARCHAR(50)',
            'autorizacion_tramite_datos VARCHAR(255)', 'expedicion_documento VARCHAR(100)', 'genero VARCHAR(50)',
            'orientacion_sexual VARCHAR(50)', 'poblacion_especial VARCHAR(50)', 'grupo_etnico VARCHAR(50)',
            'estado_civil VARCHAR(50)', 'nombre_pareja VARCHAR(255)', 'nro_pareja VARCHAR(50)',
            'enfermedades TEXT', 'otras_enfermedades TEXT', 'ultimo_nivel_estudio VARCHAR(100)',
            'nombre_titulo VARCHAR(255)', 'correo_electronico VARCHAR(255)', 'telefono VARCHAR(50)',
            'nombre_contacto_emergencia VARCHAR(255)', 'parentesco_contacto VARCHAR(100)', 'cel_emergencia VARCHAR(50)',
            'tel_fijo_emergencia VARCHAR(50)', 'departamento VARCHAR(100)', 'ciudad_residencia VARCHAR(100)',
            'barrio VARCHAR(100)', 'direccion VARCHAR(255)', 'estrato VARCHAR(10)', 'tipo_vivienda VARCHAR(100)',
            'cuenta_vehiculo_propio VARCHAR(10)', 'nro_hijos VARCHAR(10)',
            'fn_h1 VARCHAR(50)', 'nro_doc_h1 VARCHAR(50)', 'fn_h2 VARCHAR(50)', 'nro_doc_h2 VARCHAR(50)',
            'fn_h3 VARCHAR(50)', 'nro_doc_h3 VARCHAR(50)', 'fn_h4 VARCHAR(50)', 'nro_doc_h4 VARCHAR(50)',
            'fn_h5 VARCHAR(50)', 'nro_doc_h5 VARCHAR(50)',
            't_camisa VARCHAR(20)', 't_pantalon VARCHAR(20)', 't_zapatos VARCHAR(20)', 't_chaquetas VARCHAR(20)', 't_chalecos VARCHAR(20)',
            'familiar_en_empresa VARCHAR(10)', 'compania VARCHAR(100)', 'parentesco VARCHAR(100)', 'hv_referida TEXT',
            'nombre_referido VARCHAR(255)', 'familiares_pep VARCHAR(10)', 'porque_pep TEXT', 'cargo_publico VARCHAR(255)',
            'salud VARCHAR(100)', 'pension VARCHAR(100)', 'caja VARCHAR(100)', 'cuenta_bancaria VARCHAR(100)',
            'fecha_retiro VARCHAR(50)', 'motivo_retiro TEXT', 'motivo_confidencial TEXT', 'estado VARCHAR(50)',
            'lider VARCHAR(255)', 'aplica_dotacion VARCHAR(10)'
        ];

        for (const col of columns) {
            try {
                await conn.query(`ALTER TABLE people_extended_info ADD COLUMN ${col}`);
                console.log(`Columna añadida: ${col.split(' ')[0]}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    // console.log(`Columna ya existe: ${col.split(' ')[0]}`);
                } else {
                    console.error(`Error en columna ${col}:`, err.message);
                }
            }
        }

        console.log('Tabla people_extended_info completada al 100%');
        await conn.end();
    } catch (err) {
        console.error('Error general:', err);
        process.exit(1);
    }
}

run();
