require('dotenv').config();
const mysql = require('mysql2');

console.log('Intentando conectar sin especificar base de datos...\n');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error de autenticación:', err.message);
        console.error('Código:', err.code);
        process.exit(1);
    } else {
        console.log('✅ Autenticación exitosa!');
        console.log('\nObteniendo bases de datos disponibles...\n');
        
        connection.query('SHOW DATABASES;', (error, results) => {
            if (error) {
                console.error('❌ Error al listar bases de datos:', error.message);
            } else {
                console.log('Bases de datos disponibles:');
                results.forEach(db => {
                    console.log('  -', db.Database);
                });
            }
            connection.end();
            process.exit(0);
        });
    }
});
