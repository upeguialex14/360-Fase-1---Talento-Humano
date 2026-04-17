const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupNewRoleHierarchy() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('\n🔄 Configurando nueva jerarquía de roles...\n');

        // 1. Limpiar roles existentes (primero actualizar usuarios)
        console.log('1. Preparando migración de roles...');
        await connection.execute('UPDATE users SET role_id = NULL WHERE role_id IS NOT NULL');
        await connection.execute('DELETE FROM role_permissions');
        await connection.execute('DELETE FROM role_pages');
        await connection.execute('DELETE FROM roles');

        // 2. Insertar nueva jerarquía de roles
        console.log('2. Insertando nueva jerarquía de roles...');
        await connection.execute(`
            INSERT INTO roles (role_id, name_role, description, status_rol) VALUES
            (1, 'Gerente', 'Acceso total al sistema - autoridad máxima', 1),
            (2, 'Tecnologia', 'Acceso total al sistema - equipo técnico', 1),
            (3, 'Lideres', 'Gestión de equipo y operaciones', 1),
            (4, 'Soporte', 'Gestión de equipo y soporte técnico', 1),
            (5, 'Analista', 'Consulta y operaciones básicas', 1)
        `);

        // 3. Asignar permisos - Gerente y Tecnologia tienen todos los permisos
        console.log('3. Asignando permisos...');
        await connection.execute(`
            INSERT INTO role_permissions (role_id, permission_code)
            SELECT 1, permission_code FROM permissions
            UNION ALL
            SELECT 2, permission_code FROM permissions
        `);

        // 4. Asignar páginas - Gerente y Tecnologia tienen acceso total
        console.log('4. Asignando acceso a páginas...');
        await connection.execute(`
            INSERT INTO role_pages (role_id, page_code, can_view, can_edit)
            SELECT 1, page_code, 1, 1 FROM pages
            UNION ALL
            SELECT 2, page_code, 1, 1 FROM pages
        `);

        // 5. Asignar páginas para Lideres y Soporte (gestión de equipo)
        await connection.execute(`
            INSERT INTO role_pages (role_id, page_code, can_view, can_edit)
            SELECT 3, page_code, 1, 1 FROM pages WHERE page_code IN ('USUARIOS', 'ROLES', 'PERMISSIONS', 'REPORTES')
            UNION ALL
            SELECT 4, page_code, 1, 1 FROM pages WHERE page_code IN ('USUARIOS', 'ROLES', 'PERMISSIONS', 'REPORTES')
        `);

        // 6. Asignar páginas para Analista (solo consulta)
        await connection.execute(`
            INSERT INTO role_pages (role_id, page_code, can_view, can_edit)
            SELECT 5, page_code, 1, 0 FROM pages WHERE page_code IN ('DASHBOARD', 'REPORTES')
        `);

        // 7. Actualizar usuario de prueba para que sea Gerente
        console.log('5. Actualizando usuario de prueba...');
        await connection.execute(`
            UPDATE users SET role_id = 1 WHERE document_number = '0000000060'
        `);

        console.log('\n✅ Nueva jerarquía de roles configurada exitosamente!');
        console.log('\n📋 Resumen:');
        console.log('   role_id: 1 - Gerente (Full Access)');
        console.log('   role_id: 2 - Tecnologia (Full Access)');
        console.log('   role_id: 3 - Lideres (Gestión de equipo)');
        console.log('   role_id: 4 - Soporte (Gestión de equipo)');
        console.log('   role_id: 5 - Analista (Consulta básica)');

        // Verificar configuración
        const [roles] = await connection.execute('SELECT * FROM roles ORDER BY role_id');
        console.log('\n🔍 Roles configurados:');
        roles.forEach(role => {
            console.log(`   ${role.role_id}: ${role.role_name} - ${role.description}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await connection.end();
    }
}

setupNewRoleHierarchy();
