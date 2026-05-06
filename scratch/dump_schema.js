const mysql = require('../backend/node_modules/mysql2');
const fs = require('fs');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "talentohumano360",
    port: 3306
}).promise();

async function checkSchema() {
    try {
        const tables = ['PEOPLE', 'HIRING_ORDER', 'BUSINESS_PEOPLE_DATA', 'PEOPLE_HEALT_SECURITY', 'PEOPLE_EXTENDED_INFO'];
        let output = '';
        for (const table of tables) {
            output += `\nColumns for ${table}:\n`;
            const [rows] = await pool.execute(`DESCRIBE ${table}`);
            rows.forEach(r => {
                output += `${r.Field} (${r.Type})\n`;
            });
        }
        fs.writeFileSync('schema_output.txt', output);
        console.log('Schema written to schema_output.txt');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
