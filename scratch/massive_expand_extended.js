const mysql = require('mysql2/promise');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'talentohumano360'
        });

        const columnsToExpand = [
            'tipo_identificacion', 'empresa', 'cargo', 'fecha_ingreso', 'tipo_contrato', 
            'ciudad', 'unidad_negocio', 'cliente', 'ceco', 'oficina', 'fecha_vencimiento', 
            'sueldo_2026', 'auxilio_alimentacion', 'auxilio_adicional_transporte', 'bonificacion', 
            'auxilio_rodamientos_1q', 'auxilio_rodamientos_2q', 'auxilio_trans_extralegal', 
            'auxilio_conectividad', 'autorizacion_tramite_datos', 'expedicion_documento', 
            'genero', 'orientacion_sexual', 'poblacion_especial', 'grupo_etnico', 
            'estado_civil', 'nombre_pareja', 'nro_pareja', 'rh', 'ultimo_nivel_estudio', 
            'nombre_titulo', 'correo_electronico', 'telefono', 'nombre_contacto_emergencia', 
            'parentesco_contacto', 'cel_emergencia', 'tel_fijo_emergencia', 'departamento', 
            'ciudad_residencia', 'barrio', 'direccion', 'estrato', 'tipo_vivienda', 
            'cuenta_vehiculo_propio', 'nro_hijos', 'fn_h1', 'nro_doc_h1', 'fn_h2', 'nro_doc_h2', 
            'fn_h3', 'nro_doc_h3', 'fn_h4', 'nro_doc_h4', 'fn_h5', 'nro_doc_h5', 
            't_camisa', 't_pantalon', 't_zapatos', 't_chaquetas', 't_chalecos', 
            'familiar_en_empresa', 'compania', 'parentesco', 'nombre_referido', 
            'familiares_pep', 'cargo_publico', 'salud', 'pension', 'caja', 
            'cuenta_bancaria', 'fecha_retiro', 'estado', 'lider', 'aplica_dotacion'
        ];

        console.log('Ampliando columnas de people_extended_info...');
        for (const col of columnsToExpand) {
            try {
                await conn.query(`ALTER TABLE people_extended_info MODIFY COLUMN ${col} VARCHAR(255)`);
            } catch (err) {
                console.error(`Error en ${col}:`, err.message);
            }
        }

        // Asegurar que los campos de texto largo sean TEXT
        const textFields = ['enfermedades', 'otras_enfermedades', 'hv_referida', 'porque_pep', 'motivo_retiro', 'motivo_confidencial'];
        for (const col of textFields) {
            await conn.query(`ALTER TABLE people_extended_info MODIFY COLUMN ${col} TEXT`);
        }

        console.log('Ampliación completada con éxito');
        await conn.end();
    } catch (err) {
        console.error('Error general:', err);
        process.exit(1);
    }
}

run();
