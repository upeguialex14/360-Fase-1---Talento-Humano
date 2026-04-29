const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });
  const [cols] = await conn.query("SHOW COLUMNS FROM people");
  console.log(cols);
  process.exit(0);
}
run();
