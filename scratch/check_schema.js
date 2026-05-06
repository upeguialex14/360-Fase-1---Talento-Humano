const mysql = require('../backend/node_modules/mysql2');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "talentohumano360",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

async function checkSchema() {
    try {
        const tables = ['PEOPLE', 'HIRING_ORDER', 'BUSINESS_PEOPLE_DATA', 'PEOPLE_HEALT_SECURITY'];
        for (const table of tables) {
            console.log(`\nColumns for ${table}:`);
            const [rows] = await pool.execute(`DESCRIBE ${table}`);
            console.table(rows.map(r => ({ Field: r.Field, Type: r.Type, Null: r.Null })));
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
