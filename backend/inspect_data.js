require('dotenv').config();
const pool = require('./config/db');

async function inspectData() {
    try {
        console.log('--- Inspección de Integridad de Datos ---');
        
        const [people] = await pool.query('SELECT COUNT(*) as count FROM PEOPLE');
        const [bpd] = await pool.query('SELECT COUNT(*) as count FROM BUSINESS_PEOPLE_DATA');
        const [details] = await pool.query('SELECT COUNT(*) as count FROM PEOPLE_DETAILS');
        
        console.log(`- Registros en PEOPLE: ${people[0].count}`);
        console.log(`- Registros en BUSINESS_PEOPLE_DATA: ${bpd[0].count}`);
        console.log(`- Registros en PEOPLE_DETAILS: ${details[0].count}`);

        if (people[0].count > 0) {
            console.log('\n--- Muestra de PEOPLE ---');
            const [pSample] = await pool.query('SELECT people_id, first_name, last_name, people_business_id, details_id FROM PEOPLE LIMIT 3');
            console.table(pSample);

            console.log('\n--- Muestra de BUSINESS_PEOPLE_DATA ---');
            const [bSample] = await pool.query('SELECT people_business_id, start_date, status_id FROM BUSINESS_PEOPLE_DATA LIMIT 3');
            console.table(bSample);
            
            console.log('\n--- Verificando Joins ---');
            const [joined] = await pool.query(`
                SELECT p.people_id, p.first_name, bpd.status_id, bpd.start_date
                FROM PEOPLE p
                JOIN BUSINESS_PEOPLE_DATA bpd ON p.people_business_id = bpd.people_business_id
                LIMIT 3
            `);
            if (joined.length > 0) {
                console.log('✅ Joins entre PEOPLE y BUSINESS_PEOPLE_DATA funcionan.');
                console.table(joined);
            } else {
                console.log('❌ Error: No hay coincidencia entre PEOPLE y BUSINESS_PEOPLE_DATA. Verifique people_business_id.');
            }
        }

        console.log('\n--- Verificando Dotación ---');
        const [dotItems] = await pool.query('SELECT COUNT(*) as count FROM MASTER_DOTACION_ITEM');
        const [inventory] = await pool.query('SELECT COUNT(*) as count FROM DOTACION_INVENTORY');
        console.log(`- Items en catálogo: ${dotItems[0].count}`);
        console.log(`- Items en inventario: ${inventory[0].count}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error en inspección:', err);
        process.exit(1);
    }
}

inspectData();
