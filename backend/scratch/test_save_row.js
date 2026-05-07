const pool = require('../config/db');
const service = require('../services/etl/processors/hiringOrderProcessor.service');

async function testInsert() {
    const row = {
        'Cedula': '123456',
        'Nombre y Apellido': 'Test User',
        'Cuenta Bancaria': '111222333',
        'Cargo': 'Test Job',
        'Tipo de Contrato': 'Indefinido'
    };
    try {
        console.log('Testing saveRow...');
        const orderId = await service.saveRow(row, await service._loadMasters(), 'TestRunner');
        console.log('✅ Success! OrderID:', orderId);
        
        const [p] = await pool.query('SELECT people_id FROM PEOPLE WHERE document_number = ?', ['123456']);
        if (p.length > 0) {
            const [pei] = await pool.query('SELECT * FROM people_extended_info WHERE people_id = ?', [p[0].people_id]);
            console.log('Data in pei:', JSON.stringify(pei[0]));
        }
    } catch (e) {
        console.error('❌ Failed:', e);
    }
    process.exit();
}
testInsert();
