require('dotenv').config();
const pool = require('./config/db');

async function upgrade() {
    try {
        console.log('Checking roles table columns...');
        const [columns] = await pool.execute('DESCRIBE roles');
        const hasCode = columns.some(c => c.Field === 'role_code');

        if (!hasCode) {
            console.log('Adding role_code column...');
            await pool.execute('ALTER TABLE roles ADD COLUMN role_code VARCHAR(50) AFTER role_id');
            console.log('Column added.');
        }

        console.log('Updating role_code values...');
        await pool.execute('UPDATE roles SET role_code = UPPER(REPLACE(name_role, " ", "_")) WHERE role_code IS NULL OR role_code = ""');
        console.log('Roles updated successfully.');

    } catch (err) {
        console.error('Error during upgrade:', err.message);
    } finally {
        process.exit(0);
    }
}

upgrade();
