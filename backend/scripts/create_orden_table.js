const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function createTable() {
    console.log('--- Creando tabla orden_contratacion ---');
    
    const schemaPath = path.join(__dirname, '..', 'orden_schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    
    // Generar SQL a partir del schema JSON
    let sql = 'CREATE TABLE IF NOT EXISTS orden_contratacion (\n';
    
    const columnDefs = schema.map(col => {
        let def = `  ${col.Field} ${col.Type}`;
        if (col.Null === 'NO') def += ' NOT NULL';
        if (col.Field === 'id') def += ' PRIMARY KEY';
        if (col.Default) {
            if (col.Default === 'CURRENT_TIMESTAMP') {
                def += ' DEFAULT CURRENT_TIMESTAMP';
            } else if (col.Default === 'DEFAULT_GENERATED') {
                // Skip if extra handles it
            } else {
                def += ` DEFAULT '${col.Default}'`;
            }
        }
        if (col.Extra === 'DEFAULT_GENERATED') {
            // Handled by mysql automatically usually, but let's be explicit if needed
        }
        if (col.Field === 'fecha_actualizacion' && col.Default === 'CURRENT_TIMESTAMP') {
             def += ' ON UPDATE CURRENT_TIMESTAMP';
        }
        return def;
    });
    
    sql += columnDefs.join(',\n');
    sql += '\n) ENGINE=InnoDB;';
    
    console.log('SQL generado:');
    console.log(sql);
    
    try {
        await pool.execute(sql);
        console.log('Tabla creada exitosamente (o ya existía).');
        
        // Verificar si existe la página en la tabla pages
        const [pages] = await pool.execute('SELECT * FROM pages WHERE page_code = "ORDEN_CONTRATACION"');
        if (pages.length === 0) {
            console.log('Insertando página ORDEN_CONTRATACION...');
            await pool.execute(`
                INSERT INTO pages (page_code, page_name, route, description)
                VALUES ('ORDEN_CONTRATACION', 'Orden de Contratación', '/orden-contratacion', 'Módulo de gestión de órdenes de contratación')
            `);
        }
        
        // Asignar a ADMIN (rol_id = 1)
        const [rolePages] = await pool.execute('SELECT * FROM role_pages WHERE role_id = 1 AND page_code = "ORDEN_CONTRATACION"');
        if (rolePages.length === 0) {
            console.log('Asignando permisos a ADMIN...');
            await pool.execute(`
                INSERT INTO role_pages (role_id, page_code, can_view, can_edit)
                VALUES (1, 'ORDEN_CONTRATACION', 1, 1)
            `);
        }

        console.log('Configuración completada.');
    } catch (error) {
        console.error('Error al crear la tabla:', error);
    } finally {
        process.exit();
    }
}

createTable();
