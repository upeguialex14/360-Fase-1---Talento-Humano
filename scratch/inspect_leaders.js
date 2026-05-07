const mysql = require('mysql2/promise');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'talentohumano360'
        });

        console.log('--- ESTRUCTURA DE LIDERES ---');
        
        // 1. Ver FKs de HIRING_ORDER
        const [fks] = await conn.query(`
            SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'HIRING_ORDER' AND COLUMN_NAME = 'leader_id'
        `);
        console.log('Foreign Keys para leader_id:', fks);

        // 2. Ver si existe master_leader y qué tiene
        try {
            const [cols] = await conn.query('DESCRIBE master_leader');
            console.log('Columnas master_leader:', cols);
            const [data] = await conn.query('SELECT * FROM master_leader LIMIT 5');
            console.log('Muestra de datos master_leader:', data);
        } catch (e) {
            console.log('master_leader no existe o no se puede leer');
        }

        // 3. Ver si USERS tiene que ver algo
        const [users] = await conn.query("SELECT user_id, name, last_name FROM USERS WHERE role_id = (SELECT role_id FROM ROLES WHERE name_role = 'LIDER' LIMIT 1) LIMIT 5");
        console.log('Muestra de líderes en USERS:', users);

        await conn.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
