const mysql = require('../backend/node_modules/mysql2');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "talentohumano360",
    port: 3306
}).promise();

async function findTables() {
    try {
        const [tables] = await pool.execute("SHOW TABLES");
        const names = tables.map(t => Object.values(t)[0]);
        
        const filter = (term) => names.filter(n => n.toLowerCase().includes(term));
        
        console.log("Leaders:", filter("leader"));
        console.log("Jefes:", filter("jefe"));
        console.log("Analistas:", filter("analist"));
        console.log("Masters:", filter("master"));
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findTables();
