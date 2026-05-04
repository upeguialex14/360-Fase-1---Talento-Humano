const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
    let config = {
        DB_HOST: '127.0.0.1',
        DB_USER: 'root',
        DB_PASSWORD: '',
        DB_NAME: 'talentohumano360'
    };
    
    try {
        const env = fs.readFileSync('./backend/.env', 'utf8');
        env.split('\n').forEach(line => {
            const match = line.match(/^\s*([^=\s#]+)\s*=\s*["']?([^"'\s#]+)["']?/);
            if (match) {
                config[match[1]] = match[2];
            }
        });
    } catch(e) { console.log('Env read error:', e.message); }

    console.log('Config resolved:', JSON.stringify(config, null, 2));

    const connection = await mysql.createConnection({
        host: config.DB_HOST === 'localhost' ? '127.0.0.1' : config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME
    });

    const [tables] = await connection.query('SHOW TABLES');
    console.log('--- TABLES ---');
    console.log(tables.map(t => Object.values(t)[0]).join('\n'));
    process.exit(0);
}
run().catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
});
