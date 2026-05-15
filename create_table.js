const pool = require('./backend/config/db');

async function createTable() {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS DOTACION_SOLICITUD_PROVEEDOR_HISTORICO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            proveedor_nombre VARCHAR(255),
            proveedor_email VARCHAR(255),
            fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
            empresa VARCHAR(255),
            cedula VARCHAR(50),
            nombres_apellidos VARCHAR(255),
            genero VARCHAR(50),
            estado_compania VARCHAR(100),
            ciudad VARCHAR(100),
            unidad_negocio VARCHAR(255),
            oficina VARCHAR(255),
            talla_camisa VARCHAR(20),
            talla_pantalon VARCHAR(20),
            cant_pantalones INT,
            cant_camisas INT,
            cant_camisas_blancas_m1 INT,
            cant_camisas_azules_m1 INT,
            cant_camisas_azules_m2 INT,
            cant_camisas_azules_m3 INT,
            cant_pantalon_lino_m1 INT,
            cant_pantalon_lino_m2 INT,
            cant_pantalon_lino_m3 INT,
            cant_faldas_m1 INT,
            cant_faldas_m2 INT,
            cant_faldas_m3 INT,
            cant_pantalon_dril_azul_m1 INT,
            cant_pantalon_dril_azul_m2 INT,
            cant_pantalon_dril_azul_m3 INT,
            cant_pantalon_dril_caqui_m3 INT,
            cant_polo_azul_m1 INT,
            cant_polo_azul_m2 INT,
            cant_polo_azul_m3 INT,
            cant_polo_blanca_m1 INT,
            cant_polo_blanca_m2 INT,
            cant_servicios_gen_m1 INT,
            cant_servicios_gen_m2 INT,
            cant_servicios_gen_m3 INT,
            jefes_lideres_excelencia VARCHAR(255),
            ciudad_envio VARCHAR(100),
            municipio_envio VARCHAR(100),
            direccion VARCHAR(255),
            nombre_contacto_envio VARCHAR(255),
            telefono_envio VARCHAR(50),
            oficina_envio VARCHAR(255)
        );`;
        await pool.execute(query);
        console.log("Tabla DOTACION_SOLICITUD_PROVEEDOR_HISTORICO creada exitosamente");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
createTable();
