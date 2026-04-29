const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });
  
  await conn.query(`
      CREATE TABLE IF NOT EXISTS base_datos_maestra (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo_identificacion VARCHAR(50),
        empresa VARCHAR(150),
        cedula VARCHAR(50) UNIQUE NOT NULL,
        apellidos_nombres VARCHAR(200),
        cargo VARCHAR(150),
        fecha_ingreso VARCHAR(50),
        tipo_contrato VARCHAR(100),
        ciudad VARCHAR(100),
        unidad_negocio VARCHAR(100),
        cliente VARCHAR(150),
        ceco VARCHAR(100),
        oficina VARCHAR(100),
        fecha_vencimiento VARCHAR(50),
        sueldo_2026 VARCHAR(50),
        auxilio_alimentacion VARCHAR(50),
        auxilio_adicional_transporte VARCHAR(50),
        bonificacion VARCHAR(50),
        auxilio_rodamientos_1q VARCHAR(50),
        auxilio_rodamientos_2q VARCHAR(50),
        auxilio_trans_extralegal VARCHAR(50),
        auxilio_conectividad VARCHAR(50),
        autorizacion_tramite_datos VARCHAR(50),
        expedicion_documento VARCHAR(100),
        genero VARCHAR(50),
        orientacion_sexual VARCHAR(100),
        poblacion_especial VARCHAR(150),
        grupo_etnico VARCHAR(100),
        fecha_nacimiento VARCHAR(50),
        estado_civil VARCHAR(50),
        nombre_pareja VARCHAR(200),
        nro_pareja VARCHAR(50),
        rh VARCHAR(20),
        enfermedades TEXT,
        otras_enfermedades TEXT,
        ultimo_nivel_estudio VARCHAR(100),
        nombre_titulo VARCHAR(200),
        correo_electronico VARCHAR(150),
        telefono VARCHAR(50),
        nombre_contacto_emergencia VARCHAR(200),
        parentesco_contacto VARCHAR(100),
        cel_emergencia VARCHAR(50),
        tel_fijo_emergencia VARCHAR(50),
        departamento VARCHAR(100),
        ciudad_residencia VARCHAR(100),
        barrio VARCHAR(150),
        direccion VARCHAR(250),
        estrato VARCHAR(20),
        tipo_vivienda VARCHAR(50),
        cuenta_vehiculo_propio VARCHAR(20),
        nro_hijos VARCHAR(20),
        fn_h1 VARCHAR(50), nro_doc_h1 VARCHAR(50),
        fn_h2 VARCHAR(50), nro_doc_h2 VARCHAR(50),
        fn_h3 VARCHAR(50), nro_doc_h3 VARCHAR(50),
        fn_h4 VARCHAR(50), nro_doc_h4 VARCHAR(50),
        fn_h5 VARCHAR(50), nro_doc_h5 VARCHAR(50),
        t_camisa VARCHAR(20),
        t_pantalon VARCHAR(20),
        t_zapatos VARCHAR(20),
        t_chaquetas VARCHAR(20),
        t_chalecos VARCHAR(20),
        familiar_en_empresa VARCHAR(20),
        compania VARCHAR(150),
        parentesco VARCHAR(100),
        hv_referida VARCHAR(20),
        nombre_referido VARCHAR(200),
        familiares_pep VARCHAR(20),
        porque_pep TEXT,
        cargo_publico VARCHAR(20),
        salud VARCHAR(100),
        pension VARCHAR(100),
        caja VARCHAR(100),
        cuenta_bancaria VARCHAR(100),
        fecha_retiro VARCHAR(50),
        motivo_retiro TEXT,
        motivo_confidencial TEXT,
        estado VARCHAR(50),
        lider VARCHAR(150),
        aplica_dotacion VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
  `);

  await conn.query(`
      INSERT IGNORE INTO pages (page_code, page_name, route)
      VALUES ('BASE_DATOS', 'Base de datos', '/base-datos')
  `);
  
  await conn.query(`
      INSERT IGNORE INTO role_pages (role_id, page_code, can_view, can_edit)
      VALUES (1, 'BASE_DATOS', 1, 1)
  `);
  
  console.log('Done!');
  process.exit(0);
}
run();
