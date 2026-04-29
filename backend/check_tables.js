const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });
  const [t1] = await conn.query("DESCRIBE people");
  console.log('--- people ---'); console.log(t1.map(f => f.Field).join(', '));
  const [t2] = await conn.query("DESCRIBE people_details");
  console.log('--- people_details ---'); console.log(t2.map(f => f.Field).join(', '));
  const [t3] = await conn.query("DESCRIBE people_extended_info");
  console.log('--- people_extended_info ---'); console.log(t3.map(f => f.Field).join(', '));
  const [t4] = await conn.query("DESCRIBE people_healt_security");
  console.log('--- people_healt_security ---'); console.log(t4.map(f => f.Field).join(', '));
  process.exit(0);
}
run();
