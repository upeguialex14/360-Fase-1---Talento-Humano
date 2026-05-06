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

async function checkData() {
    try {
        console.log("Sample from COST_CENTER:");
        const [rows] = await pool.execute("SELECT * FROM COST_CENTER LIMIT 5");
        console.table(rows);
        
        console.log("\nSample from MASTER_JOB_TITLES:");
        const [jobs] = await pool.execute("SELECT * FROM MASTER_JOB_TITLES LIMIT 5");
        console.table(jobs);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkData();
