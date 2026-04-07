/**
 * Migration Script - Legacy DB to New MVC Structure
 * Use this to migrate data from old database structure to new one
 * Run with: node backend/scripts/migrate_legacy_db.js
 */

const pool = require('../config/db');

async function migrateDatabase() {
    try {
        console.log('[MIGRATE] Starting database migration...');

        // Step 1: Ensure all new tables exist
        console.log('[MIGRATE] Creating tables structure...');
        // Tables are created by initDatabase.sql

        // Step 2: Migrate roles
        console.log('[MIGRATE] Migrating roles...');
        const [roles] = await pool.execute('SELECT * FROM roles');
        if (roles.length === 0) {
            await pool.execute(`
                INSERT INTO roles (role_code, role_name, description) VALUES
                ('ADMIN', 'Administrador', 'Acceso total'),
                ('MANAGER', 'Gerente', 'Gestión de empleados'),
                ('EMPLOYEE', 'Empleado', 'Acceso limitado'),
                ('VIEWER', 'Visualizador', 'Solo lectura')
            `);
            console.log('[MIGRATE] ✓ Roles created');
        } else {
            console.log('[MIGRATE] ✓ Roles already exist, skipping');
        }

        // Step 3: Migrate permissions
        console.log('[MIGRATE] Migrating permissions...');
        const [perms] = await pool.execute('SELECT * FROM permissions');
        if (perms.length === 0) {
            await pool.execute(`
                INSERT INTO permissions (permission_code, permission_name, module_name) VALUES
                ('users_view', 'Ver Usuarios', 'users'),
                ('users_create', 'Crear Usuarios', 'users'),
                ('users_edit', 'Editar Usuarios', 'users'),
                ('users_delete', 'Eliminar Usuarios', 'users'),
                ('employees_view', 'Ver Empleados', 'employees'),
                ('employees_edit', 'Editar Empleados', 'employees'),
                ('reports_view', 'Ver Reportes', 'reports')
            `);
            console.log('[MIGRATE] ✓ Permissions created');
        } else {
            console.log('[MIGRATE] ✓ Permissions already exist, skipping');
        }

        // Step 4: Add missing columns to users table
        console.log('[MIGRATE] Adding missing columns to users...');
        try {
            await pool.execute('ALTER TABLE users ADD COLUMN is_locked TINYINT(1) DEFAULT 0');
            console.log('[MIGRATE] ✓ Added is_locked column');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('[MIGRATE] ✓ is_locked column already exists');
            }
        }

        try {
            await pool.execute('ALTER TABLE users ADD COLUMN failed_attempts INT DEFAULT 0');
            console.log('[MIGRATE] ✓ Added failed_attempts column');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('[MIGRATE] ✓ failed_attempts column already exists');
            }
        }

        try {
            await pool.execute('ALTER TABLE users ADD COLUMN change_password_required TINYINT(1) DEFAULT 0');
            console.log('[MIGRATE] ✓ Added change_password_required column');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('[MIGRATE] ✓ change_password_required column already exists');
            }
        }

        // Step 5: Create audit tables if they don't exist
        console.log('[MIGRATE] Ensuring audit tables exist...');

        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS login_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    login VARCHAR(50) NOT NULL,
                    user_id INT,
                    success TINYINT(1) NOT NULL,
                    failure_reason VARCHAR(50),
                    ip_address VARCHAR(45),
                    user_agent VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('[MIGRATE] ✓ login_logs table ensured');
        } catch (err) {
            console.log('[MIGRATE] ✓ login_logs table already exists');
        }

        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS user_lock_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    login VARCHAR(50),
                    email VARCHAR(100),
                    failed_attempts INT,
                    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    unlocked_at DATETIME
                )
            `);
            console.log('[MIGRATE] ✓ user_lock_history table ensured');
        } catch (err) {
            console.log('[MIGRATE] ✓ user_lock_history table already exists');
        }

        // Step 6: Create parameters table
        console.log('[MIGRATE] Creating parameters configuration...');
        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS parameters (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    param_key VARCHAR(100) UNIQUE NOT NULL,
                    param_value VARCHAR(100) NOT NULL
                )
            `);

            // Insert default parameters
            await pool.execute(`
                INSERT IGNORE INTO parameters (param_key, param_value) VALUES
                ('max_login_attempts', '5'),
                ('dias_cambio_pwd', '30')
            `);
            console.log('[MIGRATE] ✓ parameters table created with defaults');
        } catch (err) {
            console.log('[MIGRATE] ✓ parameters table already exists');
        }

        // Step 7: Validate migration
        console.log('[MIGRATE] Validating migration...');
        const [tableStats] = await pool.execute(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
        `);

        const requiredTables = [
            'users', 'roles', 'permissions', 'role_permissions',
            'parameters', 'login_logs', 'user_lock_history'
        ];

        const existingTables = tableStats.map(t => t.TABLE_NAME);
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));

        if (missingTables.length === 0) {
            console.log('[MIGRATE] ✅ Migration successful - All tables present');
        } else {
            console.log('[MIGRATE] ⚠️ Missing tables:', missingTables.join(', '));
        }

        console.log('[MIGRATE] Migration completed');
        process.exit(0);

    } catch (error) {
        console.error('[MIGRATE] ❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run migration
migrateDatabase();
