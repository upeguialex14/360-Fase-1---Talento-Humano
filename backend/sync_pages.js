require('dotenv').config();
const pool = require('./config/db');

const DEFINITIVE_PAGES = [
    { code: 'DASHBOARD', name: 'Dashboard', route: '/dashboard', desc: 'Panel principal de indicadores' },
    { code: 'ROLES', name: 'Gestión de Roles', route: '/roles', desc: 'Administración de jerarquías y roles' },
    { code: 'USUARIOS', name: 'Gestión de Usuarios', route: '/users', desc: 'Administración de personal y cuentas de acceso' },
    { code: 'PLANTA', name: 'Planta Operación', route: '/planta', desc: 'Control de personal operativo' },
    { code: 'COSTOS', name: 'Centro de Costos', route: '/costos', desc: 'Gestión financiera por áreas' },
    { code: 'ORDEN_CONTRATACION', name: 'Orden de Contratación', route: '/contratacion', desc: 'Generación y gestión de documentos legales' },
    { code: 'BASE_DATOS', name: 'Base de Datos', route: '/base-datos', desc: 'Módulo de gestión integral de datos de empleados' },
    { code: 'ROLE_PAGE_ACCESS', name: 'Accesos por Rol', route: '/role-page-access', desc: 'Configuración de permisos de visualización y edición' },
    { code: 'BLOCKED_USERS', name: 'Usuarios Bloqueados', route: '/admin/blocked-users', desc: 'Administración de cuentas de usuario bloqueadas' },
    { code: 'SOLICITUD_VACANTES', name: 'Solicitud de Vacantes', route: '/solicitud-vacantes', desc: 'Gestión de nuevas vacantes laborales' },
    { code: 'GESTION_REQUISICIONES', name: 'Gestión de Requisiciones', route: '/gestion-requisiciones', desc: 'Control y seguimiento de requisiciones' },
    { code: 'DOCUMENTACION', name: 'Documentación', route: '/documentacion', desc: 'Repositorio de documentos y archivos' },
    // { code: 'VACACIONES', name: 'Vacaciones', route: '/vacaciones', desc: 'Gestión de solicitudes y saldo de vacaciones' },
    { code: 'BASE_INACTIVA', name: 'Base Inactiva', route: '/base-inactiva', desc: 'Histórico de empleados inactivos' },
    // { code: 'BASE_UNIFICADA', name: 'Base Unificada', route: '/base-unificada', desc: 'Consolidado general de información' },
    { code: 'USUARIO_SAHG', name: 'Usuario Sahg', route: '/usuario-sahg', desc: 'Módulo de gestión Usuario Sahg' },
    { code: 'CREACION_USUARIO_PLANTA', name: 'Creación Usuario Planta', route: '/creacion-usuario-planta', desc: 'Formulario de ingreso para planta' },
    { code: 'CREACION_USUARIO_BASE', name: 'Creación Usuario Base', route: '/creacion-usuario-base', desc: 'Formulario de ingreso manual para Base de Datos' },
    { code: 'EMPLEADOS', name: 'Empleados', route: '/empleados', desc: 'Vista general de personal y nómina' },
    { code: 'DEPARTAMENTOS', name: 'Departamentos', route: '/departamentos', desc: 'Estructura organizacional y áreas' }
];

async function syncPages() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        console.log('Cleaning up pages table...');

        // 1. Delete all current pages (we'll re-insert the definitive ones)
        // Disable foreign key checks temporarily if needed, but let's try direct delete first
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE pages');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Inserting definitive pages...');
        for (const p of DEFINITIVE_PAGES) {
            await connection.execute(
                `INSERT INTO pages (page_code, page_name, route, description, status_page) 
                 VALUES (?, ?, ?, ?, 1)`,
                [p.code, p.name, p.route, p.desc]
            );
        }

        console.log('Adding UNIQUE constraint to page_code if it doesn\'t exist...');
        try {
            await connection.execute('ALTER TABLE pages ADD UNIQUE (page_code)');
        } catch (e) {
            // Already exists or other error
        }

        console.log('Fixing role_pages references...');
        // Fix role_pages that might have old codes (like 'USERS' instead of 'USUARIOS')
        await connection.execute("UPDATE role_pages SET page_code = 'USUARIOS' WHERE page_code = 'USERS'");

        // Delete role_pages that don't match any page_code in the definitive list
        const codes = DEFINITIVE_PAGES.map(p => `'${p.code}'`).join(',');
        await connection.execute(`DELETE FROM role_pages WHERE page_code NOT IN (${codes})`);

        // Link page_id in role_pages based on page_code
        await connection.execute(`
            UPDATE role_pages rp
            JOIN pages p ON rp.page_code = p.page_code
            SET rp.page_id = p.page_id
        `);

        await connection.commit();
        console.log('Sync completed successfully.');

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Error during sync:', err);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

syncPages();
