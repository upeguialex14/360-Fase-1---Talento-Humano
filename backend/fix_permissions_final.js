require('dotenv').config();
const pool = require('./config/db');

async function fixPermissions() {
    try {
        console.log('🛠️ Corrigiendo permisos en role_pages...');
        
        // 1. Asegurar que la página DOTACION existe en la tabla pages
        const [pageRows] = await pool.query("SELECT page_id FROM pages WHERE page_code = 'DOTACION'");
        let pageId;
        if (pageRows.length === 0) {
            const [res] = await pool.query("INSERT INTO pages (page_name, page_code, route, description, status_page) VALUES ('Dotación', 'DOTACION', '/dotacion', 'Gestión de dotación de personal', 1)");
            pageId = res.insertId;
            console.log('✅ Página DOTACION creada.');
        } else {
            pageId = pageRows[0].page_id;
            console.log('✅ Página DOTACION encontrada.');
        }

        // 2. Dar permiso can_view y can_edit a todos los roles existentes
        const [roles] = await pool.query("SELECT role_id, name_role FROM roles");
        for (const role of roles) {
            await pool.query(`
                INSERT INTO role_pages (role_id, page_id, page_code, can_view, can_edit)
                VALUES (?, ?, 'DOTACION', 1, 1)
                ON DUPLICATE KEY UPDATE can_view = 1, can_edit = 1
            `, [role.role_id, pageId]);
            console.log(`✅ Permisos asignados al rol: ${role.name_role}`);
        }

        console.log('🚀 Permisos sincronizados correctamente.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing permissions:', err);
        process.exit(1);
    }
}

fixPermissions();
