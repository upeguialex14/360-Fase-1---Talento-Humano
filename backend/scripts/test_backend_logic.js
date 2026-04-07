const pool = require('../config/db');

async function runTest() {
    console.log('--- Iniciando Prueba de Backend para role_pages ---');

    const testRole = 'ADMIN'; // Asumiendo que existe
    const testPage = 'DASHBOARD'; // Asumiendo que existe

    try {
        // 1. Verificar conexión
        const [rows] = await pool.execute('SELECT 1');
        console.log('✅ Conexión a DB: Operativa');

        // 2. Verificar existencia de tablas
        const [tableCheck] = await pool.execute("SHOW TABLES LIKE 'role_pages'");
        if (tableCheck.length > 0) {
            console.log('✅ Tabla role_pages: Existe');
        } else {
            console.log('❌ Tabla role_pages: NO EXISTE');
            process.exit(1);
        }

        // 3. Simular lógica de validación (Role)
        const [roleRows] = await pool.execute('SELECT role_code FROM roles WHERE role_code = ?', [testRole]);
        if (roleRows.length > 0) {
            console.log(`✅ Validación de Rol (${testRole}): Exitosa`);
        } else {
            console.log(`⚠️ Advertencia: El rol ${testRole} no existe para la prueba.`);
        }

        // 4. Simular lógica de validación (Page)
        const [pageRows] = await pool.execute('SELECT page_code FROM pages WHERE page_code = ?', [testPage]);
        if (pageRows.length > 0) {
            console.log(`✅ Validación de Página (${testPage}): Exitosa`);
        } else {
            console.log(`⚠️ Advertencia: La página ${testPage} no existe para la prueba.`);
        }

        // 5. Verificar UPSERT Query
        const upsertQuery = `
            INSERT INTO role_pages (role_code, page_code, can_view, can_edit)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                can_view = VALUES(can_view),
                can_edit = VALUES(can_edit),
                updated_at = CURRENT_TIMESTAMP
        `;

        if (roleRows.length > 0 && pageRows.length > 0) {
            await pool.execute(upsertQuery, [testRole, testPage, 1, 1]);
            console.log(`✅ UPSERT Ejecutado para ${testRole} en ${testPage}`);
        }

        console.log('--- Fin de la prueba ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la prueba:', error.message);
        process.exit(1);
    }
}

runTest();
