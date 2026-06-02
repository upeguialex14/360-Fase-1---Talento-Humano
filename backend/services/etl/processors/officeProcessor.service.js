const pool = require('../../../config/db');
const bcrypt = require('bcrypt');

const process = async (rawJson) => {
    console.log('🏁 Iniciando proceso de carga masiva de Oficinas...');
    
    // 1. Cargar Maestros a Memoria (Caché local)
    const [cities, areas, regionales, departaments, leaders, users] = await Promise.all([
        pool.execute('SELECT city_id as id, name as nombre, departament_id FROM master_cities').then(([rows]) => rows),
        pool.execute('SELECT area_id as id, name as nombre FROM master_area').then(([rows]) => rows),
        pool.execute('SELECT regional_id as id, name as nombre FROM master_regional').then(([rows]) => rows),
        pool.execute('SELECT departament_id as id, name as nombre FROM master_departament').then(([rows]) => rows),
        pool.execute(`
            SELECT ml.leader_id as id, CONCAT(u.name, ' ', u.last_name) as nombre, ml.user_id, u.email
            FROM master_leader ml
            JOIN users u ON ml.user_id = u.user_id
        `).then(([rows]) => rows),
        pool.execute('SELECT user_id as id, email, CONCAT(name, " ", last_name) as nombre FROM users').then(([rows]) => rows)
    ]);

    // Helper de Normalización profunda
    const normalize = (str) => {
        if (!str) return '';
        return str.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Obtener role_id dinámico de líderes
    const [roles] = await pool.execute("SELECT role_id FROM roles WHERE UPPER(name_role) IN ('LIDER', 'LIDERES')");
    const LEADER_ROLE_ID = roles.length > 0 ? roles[0].role_id : 3;

    const STATUS_DEFAULT = 1;
    const EMAIL_DOMAIN = 'talento.com';
    const DEFAULT_PASSWORD = 'Lider360*';

    // Helper construir correo institucional
    function buildEmail(fullName) {
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0].toLowerCase();
        const lastName = parts[parts.length - 1]
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        return `${firstName}.${lastName}@${EMAIL_DOMAIN}`;
    }

    // Helper dividir nombres y apellidos
    function splitName(fullName) {
        const parts = fullName.trim().split(/\s+/);
        const name = parts.slice(0, 2).join(' ');
        const lastName = parts.slice(2).join(' ') || parts[0];
        return { name, lastName };
    }

    // ─── FUNCIONES GET-OR-CREATE CON MEMORY-CACHE ───────────────────────────────

    async function getOrCreateCity(cityName) {
        if (!cityName) return null;
        const nameStr = cityName.toString().trim();
        if (!nameStr || nameStr === '-' || nameStr === 'null') return null;

        const key = normalize(nameStr);
        let match = cities.find(c => normalize(c.nombre) === key);
        if (match) return match;

        // No existe → Crear e inyectar en memoria
        const [result] = await pool.execute(
            'INSERT INTO master_cities (name, status_id) VALUES (?, ?)',
            [nameStr, STATUS_DEFAULT]
        );
        console.log(`  🏙️  Ciudad creada en BD: "${nameStr}" (id=${result.insertId})`);
        
        const newCity = { id: result.insertId, nombre: nameStr, departament_id: null };
        cities.push(newCity);
        return newCity;
    }

    async function getOrCreateArea(areaName) {
        if (!areaName) return null;
        const nameStr = areaName.toString().trim();
        if (!nameStr || nameStr === '-' || nameStr === 'null') return null;

        const key = normalize(nameStr);
        let match = areas.find(a => normalize(a.nombre) === key);
        if (match) return match.id;

        // No existe → Crear e inyectar en memoria
        const [result] = await pool.execute(
            'INSERT INTO master_area (name, status_id) VALUES (?, ?)',
            [nameStr, STATUS_DEFAULT]
        );
        console.log(`  📍  Área/Zona creada en BD: "${nameStr}" (id=${result.insertId})`);
        
        const newId = result.insertId;
        areas.push({ id: newId, nombre: nameStr });
        return newId;
    }

    async function getOrCreateRegional(regionalName) {
        if (!regionalName) return null;
        const nameStr = regionalName.toString().trim();
        if (!nameStr || nameStr === '-' || nameStr === 'null') return null;

        const key = normalize(nameStr);
        let match = regionales.find(r => normalize(r.nombre) === key);
        if (match) return match.id;

        // No existe → Crear e inyectar en memoria
        const [result] = await pool.execute(
            'INSERT INTO master_regional (name, status_id) VALUES (?, ?)',
            [nameStr, STATUS_DEFAULT]
        );
        console.log(`  🗺️  Regional creada en BD: "${nameStr}" (id=${result.insertId})`);
        
        const newId = result.insertId;
        regionales.push({ id: newId, nombre: nameStr });
        return newId;
    }

    async function getOrCreateLeader(leaderName) {
        if (!leaderName) return null;
        const nameStr = leaderName.toString().trim();
        if (!nameStr || nameStr === '-' || nameStr === 'null' || nameStr.toLowerCase() === 'no aplica') return null;

        const key = normalize(nameStr);
        
        // Buscar en el maestro de líderes cargado en memoria
        let match = leaders.find(l => normalize(l.nombre) === key || normalize(l.nombre).includes(key) || key.includes(normalize(l.nombre)));
        if (match) return match.id;

        // Si no está registrado como líder, buscar en la lista general de usuarios
        const email = buildEmail(nameStr);
        const { name, lastName } = splitName(nameStr);

        let userMatch = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        let userId;

        if (userMatch) {
            userId = userMatch.id;
            console.log(`  👤  Usuario ya existía: "${nameStr}" (user_id=${userId})`);
        } else {
            // Crear usuario nuevo en la tabla users
            const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
            const [userResult] = await pool.execute(
                `INSERT INTO users (name, last_name, email, password_hash, role_id, status_id, requires_password_change)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, lastName, email, passwordHash, LEADER_ROLE_ID, STATUS_DEFAULT, 1]
            );
            userId = userResult.insertId;
            console.log(`  👤  Usuario líder creado en USERS: "${nameStr}" → ${email} (user_id=${userId})`);
            users.push({ id: userId, email, nombre: `${name} ${lastName}` });
        }

        // Verificar si este usuario ya tiene una entrada en master_leader en memoria
        let leaderWithUser = leaders.find(l => l.user_id === userId);
        if (leaderWithUser) {
            return leaderWithUser.id;
        }

        // Crear registro en la tabla maestra de líderes
        const [leaderResult] = await pool.execute(
            'INSERT INTO master_leader (user_id, status_id) VALUES (?, ?)',
            [userId, STATUS_DEFAULT]
        );
        console.log(`  🏆  Líder creado en master_leader: "${nameStr}" (leader_id=${leaderResult.insertId})`);
        
        const newLeaderId = leaderResult.insertId;
        leaders.push({ id: newLeaderId, nombre: `${name} ${lastName}`, user_id: userId, email });
        return newLeaderId;
    }

    let processed = 0;
    let inserted = 0;
    let errors = [];

    // ─── PROCESO PRINCIPAL ───────────────────────────────────────────────────

    try {
        // TRUNCATE de la tabla master_offices con desactivación temporal de FK checks
        console.log('🗑️  Ejecutando TRUNCATE en master_offices...');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        await pool.execute('TRUNCATE TABLE master_offices');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ TRUNCATE completado.');

        // Recorrer filas del Excel
        for (let i = 0; i < rawJson.length; i++) {
            const row = rawJson[i];

            const officeName = row['OFICINA'] || row['Oficina'] || '';
            const cityName   = row['CIUDAD']  || row['Ciudad']  || '';
            const zonaName   = row['ZONA']    || row['Zona']    || '';
            const regionalName = row['REGIONAL'] || row['Regional'] || '';
            const leaderName   = row['LIDER']    || row['Lider']    || row['LÍDER'] || '';

            if (!officeName.toString().trim()) {
                continue; // Saltar filas vacías
            }

            try {
                processed++;
                const cityData    = await getOrCreateCity(cityName);
                const zona_id     = await getOrCreateArea(zonaName);
                const id_regional = await getOrCreateRegional(regionalName);
                const leader_id   = await getOrCreateLeader(leaderName);

                const id_ciudad      = cityData ? cityData.id : null;
                const departament_id = cityData ? cityData.departament_id : null;

                await pool.execute(
                    `INSERT INTO master_offices (name, id_ciudad, status_id, departament_id, leader_id, zona_id, id_regional, created_ad)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
                    [
                        officeName.toString().trim(),
                        id_ciudad,
                        STATUS_DEFAULT,
                        departament_id,
                        leader_id,
                        zona_id,
                        id_regional
                    ]
                );
                inserted++;
            } catch (rowErr) {
                const errMsg = `Error en fila ${i + 2} (${officeName}): ${rowErr.message}`;
                console.error(errMsg);
                errors.push(errMsg);
            }
        }

        console.log(`\n🎉 Carga de Oficinas finalizada. Procesadas: ${processed}, Insertadas: ${inserted}, Fallidas: ${errors.length}\n`);

        return {
            success: errors.length === 0 || inserted > 0,
            totalProcessed: rawJson.length,
            inserted,
            failed: errors.length,
            errors
        };

    } catch (err) {
        console.error('❌ Error general procesando carga de Oficinas:', err);
        return {
            success: false,
            message: err.message,
            errors: [err.message]
        };
    }
};

module.exports = { process };
