const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const db = require('./backend/config/db');

async function updateSchema() {
    try {
        console.log('Aplicando cambios de esquema...');
        
        await db.execute('ALTER TABLE people_extended_info MODIFY COLUMN number_phone_emergency VARCHAR(50)');
        console.log('✓ Modificado number_phone_emergency a VARCHAR(50)');
        
        try {
            await db.execute('ALTER TABLE business_people_data ADD COLUMN office_id INT AFTER status_id');
            console.log('✓ Añadida columna office_id a business_people_data');
        } catch (e) {
            if (e.message.includes('Duplicate column name')) console.log('✓ Columna office_id ya existe');
            else throw e;
        }

        console.log('Esquema actualizado correctamente.');
    } catch (error) {
        console.error('Error actualizando esquema:', error.message);
    } finally {
        process.exit();
    }
}

updateSchema();
