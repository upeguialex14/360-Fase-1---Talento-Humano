require('dotenv').config();
const pool = require('./config/db');

async function checkPermissions() {
    try {
        const [rows] = await pool.query(`
            SELECT r.name as role, p.name as page, rp.can_view 
            FROM roles_permissions rp 
            JOIN roles r ON rp.role_id = r.role_id 
            JOIN pages p ON rp.page_id = p.page_id 
            WHERE p.code = 'DOTACION'
        `);
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error checking permissions:', err);
        process.exit(1);
    }
}

checkPermissions();
