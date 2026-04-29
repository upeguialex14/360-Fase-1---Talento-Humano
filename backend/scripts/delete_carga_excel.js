const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function deletePage() {
    try {
        await pool.query('DELETE FROM role_pages WHERE page_id IN (SELECT page_id FROM pages WHERE page_code = "CARGA_EXCEL")');
        await pool.query('DELETE FROM pages WHERE page_code = "CARGA_EXCEL"');
        console.log('✅ Página CARGA_EXCEL eliminada de la BD con éxito.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

deletePage();
