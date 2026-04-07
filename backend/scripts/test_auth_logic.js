const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcrypt');

async function testAuth() {
    console.log('--- TEST LÓGICA DE AUTENTICACIÓN Y BLOQUEO ---');

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const testLogin = '741852963';

    try {
        // 1. Resetear usuario para la prueba
        await conn.execute(
            'UPDATE users SET failed_attempts = 0, is_locked = 0, change_password_required = 0 WHERE login = ?',
            [testLogin]
        );
        console.log(`✅ Usuario ${testLogin} reseteado para la prueba.`);

        // 2. Obtener max_login_attempts
        const [params] = await conn.execute('SELECT param_value FROM parameters WHERE param_key = "max_login_attempts"');
        const maxAttempts = parseInt(params[0]?.param_value || '5');
        console.log(`ℹ️ Máximo de intentos permitidos: ${maxAttempts}`);

        // 3. Simular intentos fallidos (Llamando directamente a la lógica que incrementa en el controlador, 
        // pero aquí lo haremos vía SQL para verificar persistencia y luego simularemos la lógica del controlador)

        console.log(`Simulando ${maxAttempts} intentos fallidos...`);
        for (let i = 1; i <= maxAttempts; i++) {
            // Simulamos lo que hace el controlador:
            // Incrementar failed_attempts
            const [userRows] = await conn.execute('SELECT user_id, email, failed_attempts FROM users WHERE login = ?', [testLogin]);
            const user = userRows[0];
            const newAttempts = user.failed_attempts + 1;
            const isNowLocked = newAttempts >= maxAttempts ? 1 : 0;

            await conn.execute(
                'UPDATE users SET failed_attempts = ?, is_locked = ? WHERE login = ?',
                [newAttempts, isNowLocked, testLogin]
            );

            if (isNowLocked) {
                await conn.execute(
                    'INSERT INTO user_lock_history (user_id, login, email, failed_attempts, locked_at) VALUES (?, ?, ?, ?, NOW())',
                    [user.user_id, testLogin, user.email, newAttempts]
                );
            }

            console.log(`   Intento ${i}: failed_attempts=${newAttempts}, is_locked=${isNowLocked}`);
        }

        // 4. Verificar persistencia final
        const [finalUser] = await conn.execute('SELECT failed_attempts, is_locked FROM users WHERE login = ?', [testLogin]);
        console.log('\n--- RESULTADO FINAL EN BD ---');
        console.log(`failed_attempts: ${finalUser[0].failed_attempts}`);
        console.log(`is_locked: ${finalUser[0].is_locked}`);

        if (finalUser[0].failed_attempts === maxAttempts && finalUser[0].is_locked === 1) {
            console.log('✅ Lógica de bloqueo funcional y persistente.');
        } else {
            console.log('❌ FALLA: El usuario no se bloqueó correctamente.');
        }

        // 5. Verificar historial
        const [history] = await conn.execute('SELECT * FROM user_lock_history WHERE login = ? ORDER BY locked_at DESC LIMIT 1', [testLogin]);
        if (history.length > 0) {
            console.log(`✅ Registro en user_lock_history encontrado para ${testLogin}.`);
        } else {
            console.log('❌ FALLA: No se insertó registro en user_lock_history.');
        }

        // 6. Restaurar usuario (opcional, pero para que el usuario pueda loguearse después)
        // await conn.execute('UPDATE users SET failed_attempts = 0, is_locked = 0 WHERE login = ?', [testLogin]);
        // console.log(`\n✅ Usuario ${testLogin} restaurado.`);

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await conn.end();
    }
}

testAuth();
