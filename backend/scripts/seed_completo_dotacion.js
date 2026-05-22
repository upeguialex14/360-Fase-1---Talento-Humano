/**
 * Script de Poblamiento Completo de Datos de Prueba — Módulo de Dotación
 * 
 * Este script inserta datos de prueba coherentes para que puedas evaluar de extremo a extremo
 * el módulo de dotación (elegibilidad, stock, alertas, entregas, firmas y encuestas),
 * vinculando los datos de planta_operaciones (n8n) con PEOPLE, BUSINESS_PEOPLE_DATA y tallas.
 * 
 * Uso: node scripts/seed_completo_dotacion.js (desde la carpeta backend)
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const TEST_CEDULAS = ['999001', '999002', '999003', '999004', '999005'];

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log('🌱 Iniciando poblamiento de datos ficticios de Dotación...\n');

    try {
        // --- 0. ASEGURAR QUE EXISTE LA TABLA PLANTA_OPERACIONES ---
        console.log('🏗️ Creando tabla planta_operaciones si no existe...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS planta_operaciones (
                id_planta INT AUTO_INCREMENT PRIMARY KEY,
                empleador VARCHAR(150),
                cedula VARCHAR(50) UNIQUE NOT NULL,
                nombre VARCHAR(255),
                cargo VARCHAR(150),
                correo_corp VARCHAR(150),
                usuario_ad VARCHAR(100) UNIQUE,
                clave_osticket VARCHAR(255),
                fecha_ingreso VARCHAR(50),
                contrato VARCHAR(100),
                tipo_empleado VARCHAR(100),
                regional VARCHAR(100),
                zona VARCHAR(100),
                ciudad VARCHAR(100),
                unidad_negocio VARCHAR(100),
                cliente VARCHAR(150),
                empresa VARCHAR(150),
                codigo_ptr VARCHAR(100),
                cc_helisa VARCHAR(100),
                oficina VARCHAR(150),
                vacante_sobrante VARCHAR(100),
                planta_aprobada VARCHAR(100),
                supervisor_gerente VARCHAR(150),
                status VARCHAR(100),
                novedad VARCHAR(255),
                motivo_retiro TEXT,
                fecha_inicial VARCHAR(50),
                fecha_final VARCHAR(50),
                fecha_retiro VARCHAR(50),
                traslado_oficina_destino VARCHAR(150),
                dias_ausencia INT DEFAULT 0,
                observacion TEXT,
                jornada VARCHAR(100),
                correo VARCHAR(150),
                estado VARCHAR(50),
                banco VARCHAR(100),
                cuenta_bancaria VARCHAR(100),
                tipo_cuenta VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla planta_operaciones verificada.\n');

        // --- 1. LIMPIEZA DE DATOS ANTERIORES DE PRUEBA ---
        console.log('🧹 Limpiando registros anteriores de pruebas (Cédulas 999*)...');
        
        // Obtener IDs de las personas de prueba para borrar entregas y tallas asociadas
        const [peopleRows] = await conn.query(
            'SELECT people_id, details_id, people_business_id FROM PEOPLE WHERE document_number IN (?, ?, ?, ?, ?)',
            TEST_CEDULAS
        );

        if (peopleRows.length > 0) {
            const peopleIds = peopleRows.map(p => p.people_id);
            const detailsIds = peopleRows.map(p => p.details_id).filter(id => id !== null);
            const businessIds = peopleRows.map(p => p.people_business_id).filter(id => id !== null);

            // Eliminar encuestas
            await conn.query('DELETE FROM DOTACION_SATISFACTION_SURVEY WHERE people_id IN (' + peopleIds.join(',') + ')');
            
            // Eliminar movimientos de inventario de las entregas de prueba
            const [deliveryRows] = await conn.query('SELECT delivery_id FROM DOTACION_DELIVERY WHERE people_id IN (' + peopleIds.join(',') + ')');
            if (deliveryRows.length > 0) {
                const deliveryIds = deliveryRows.map(d => d.delivery_id);
                await conn.query('DELETE FROM DOTACION_INVENTORY_MOVEMENT WHERE delivery_id IN (' + deliveryIds.join(',') + ')');
                await conn.query('DELETE FROM DOTACION_DELIVERY_DETAIL WHERE delivery_id IN (' + deliveryIds.join(',') + ')');
                await conn.query('DELETE FROM DOTACION_DELIVERY WHERE delivery_id IN (' + deliveryIds.join(',') + ')');
            }

            // Eliminar personas y sus tablas hijas
            await conn.query('DELETE FROM PEOPLE WHERE people_id IN (' + peopleIds.join(',') + ')');
            if (businessIds.length > 0) {
                await conn.query('DELETE FROM BUSINESS_PEOPLE_DATA WHERE people_business_id IN (' + businessIds.join(',') + ')');
            }
            if (detailsIds.length > 0) {
                await conn.query('DELETE FROM PEOPLE_DETAILS WHERE details_id IN (' + detailsIds.join(',') + ')');
            }
        }

        // Eliminar de planta_operaciones
        await conn.query('DELETE FROM planta_operaciones WHERE cedula IN (?, ?, ?, ?, ?)', TEST_CEDULAS);
        console.log('✅ Limpieza completada con éxito.\n');


        // --- 2. CONFIGURACIÓN DE CLIENTES (Excepción Día 1) ---
        console.log('⚙️ Configurando reglas de cliente (Día 1)...');
        // Asegurar que existan configuraciones de prueba
        // Cliente_id 1 = REVAL (Día-1 Activo)
        await conn.query(`
            INSERT INTO DOTACION_CLIENT_CONFIG (client_id, requires_day_one, notes)
            VALUES (1, 1, 'Excepción Día 1 para REVAL (Pruebas)')
            ON DUPLICATE KEY UPDATE requires_day_one = 1
        `);
        // Cliente_id 2 = FUERZA DE VENTA EN CAMPO (Día-1 Inactivo)
        await conn.query(`
            INSERT INTO DOTACION_CLIENT_CONFIG (client_id, requires_day_one, notes)
            VALUES (2, 0, 'Estándar 120 días (Pruebas)')
            ON DUPLICATE KEY UPDATE requires_day_one = 0
        `);
        console.log('✅ Configuración de clientes aplicada.');


        // --- 3. MAESTRO DE ITEMS Y PRENDAS POR UNIDAD ---
        console.log('👕 Vinculando catálogo de prendas con unidades de negocio...');
        // Asegurar que el catálogo básico esté completo en MASTER_DOTACION_ITEM
        const [items] = await conn.query('SELECT item_id, item_name FROM MASTER_DOTACION_ITEM');
        const itemMap = {};
        items.forEach(it => { itemMap[it.item_name] = it.item_id; });

        // Asociar prendas a unidades de negocio (DOTACION_UNIT_ITEM)
        // Unidad 1 (U. TRANSACCIONAL) recibe: Camisa (3), Pantalón (3), Zapatos (1)
        if (itemMap['Camisa']) await conn.query('INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (1, ?, 3)', [itemMap['Camisa']]);
        if (itemMap['Pantalón']) await conn.query('INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (1, ?, 3)', [itemMap['Pantalón']]);
        if (itemMap['Zapatos']) await conn.query('INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (1, ?, 1)', [itemMap['Zapatos']]);

        // Unidad 2 (ESPECIALIZADO) recibe: Camisa (3), Pantalón (3), Zapatos (1), Chaqueta (1)
        if (itemMap['Camisa']) await conn.query('INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (2, ?, 3)', [itemMap['Camisa']]);
        if (itemMap['Pantalón']) await conn.query('INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (2, ?, 3)', [itemMap['Pantalón']]);
        if (itemMap['Zapatos']) await conn.query('INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (2, ?, 1)', [itemMap['Zapatos']]);
        if (itemMap['Chaqueta']) await conn.query('INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (2, ?, 1)', [itemMap['Chaqueta']]);

        console.log('✅ Prendas asociadas a U. TRANSACCIONAL y ESPECIALIZADO con éxito.');


        // --- 4. INVENTARIO Y ALERTAS ---
        console.log('📦 Creando stock de inventario con niveles críticos para alertas...');
        // Registrar tallas variadas
        const sizeGroups = {
            'Camisa': ['S', 'M', 'L', 'XL'],
            'Pantalón': ['28', '30', '32', '34', '36'],
            'Zapatos': ['37', '38', '39', '40', '41', '42'],
            'Chaqueta': ['S', 'M', 'L', 'XL'],
            'Chaleco': ['S', 'M', 'L', 'XL']
        };

        // Eliminar alertas anteriores de pruebas para evitar colisiones
        await conn.query('DELETE FROM DOTACION_ALERT_LOG WHERE status = \'PENDIENTE\'');

        for (const [itemName, itemId] of Object.entries(itemMap)) {
            const sizes = sizeGroups[itemName] || ['M'];
            for (const s of sizes) {
                // Generar stock variado
                let qty = Math.floor(Math.random() * 60) + 15; // Stock normal
                
                // Forzar stock BAJO (crítico) en algunas tallas específicas para probar alertas
                if (itemName === 'Camisa' && s === 'M') qty = 2; // Crítico (< 5)
                if (itemName === 'Zapatos' && s === '40') qty = 1; // Crítico (< 5)
                if (itemName === 'Chaqueta' && s === 'S') qty = 0; // Agotado

                await conn.query(`
                    INSERT INTO DOTACION_INVENTORY (item_id, size, quantity_available, min_stock_alert)
                    VALUES (?, ?, ?, 5)
                    ON DUPLICATE KEY UPDATE quantity_available = VALUES(quantity_available)
                `, [itemId, s, qty]);

                // Registrar log de alerta si el stock es crítico
                if (qty <= 5) {
                    await conn.query(`
                        INSERT INTO DOTACION_ALERT_LOG (item_id, size, quantity_at_alert, min_threshold, status)
                        VALUES (?, ?, ?, 5, 'PENDIENTE')
                    `, [itemId, s, qty]);
                }
            }
        }
        console.log('✅ Inventario poblado con algunos artículos con bajo stock para disparar alertas.');


        // --- 5. CREACIÓN DE EMPLEADOS DE PRUEBA (5 CASOS CLAVE) ---
        console.log('👥 Insertando 5 empleados de prueba con escenarios de negocio variados...');

        // Fechas de cálculo
        const today = new Date();
        const dateDaysAgo = (days) => {
            const d = new Date();
            d.setDate(today.getDate() - days);
            return d.toISOString().split('T')[0];
        };

        const testPeople = [
            {
                cedula: '999001',
                nombre: 'Juan Perez',
                cargo: 'Cajero de Sucursal',
                email: 'juan.perez.test@company.com',
                fechaIngreso: dateDaysAgo(150), // Antigüedad: ~5 meses (>120 días)
                unidadId: 1, // U. TRANSACCIONAL
                unidadNombre: 'U. TRANSACCIONAL',
                clientId: 2, // FUERZA DE VENTA EN CAMPO (Config: Estándar)
                clientNombre: 'FUERZA DE VENTA EN CAMPO',
                oficinaId: 418,
                oficinaNombre: 'ADMIN FUERZA VENTAS',
                tallas: { camisa: 'M', pantalon: '32', zapatos: '40', chaqueta: 'M', chaleco: 'M' },
                active: 1,
                statusPlanta: 'Activo',
                novedadPlanta: 'Ninguna',
                escenario: 'ELEGIBLE REGULAR (Antigüedad > 120 días en cliente normal)',
                yaEntregado: false
            },
            {
                cedula: '999002',
                nombre: 'Maria Rodriguez',
                cargo: 'Auxiliar Operativo',
                email: 'maria.rodriguez.test@company.com',
                fechaIngreso: dateDaysAgo(30), // Antigüedad: 30 días (< 120 días)
                unidadId: 1, // U. TRANSACCIONAL
                unidadNombre: 'U. TRANSACCIONAL',
                clientId: 2, // FUERZA DE VENTA EN CAMPO (Config: Estándar)
                clientNombre: 'FUERZA DE VENTA EN CAMPO',
                oficinaId: 418,
                oficinaNombre: 'ADMIN FUERZA VENTAS',
                tallas: { camisa: 'S', pantalon: '30', zapatos: '38', chaqueta: 'S', chaleco: 'S' },
                active: 1,
                statusPlanta: 'Activo',
                novedadPlanta: 'Ninguna',
                escenario: 'NO ELEGIBLE (Antigüedad insuficiente de 30 días en cliente normal)',
                yaEntregado: false
            },
            {
                cedula: '999003',
                nombre: 'Carlos Gomez',
                cargo: 'Cajero Principal Especializado',
                email: 'carlos.gomez.test@company.com',
                fechaIngreso: dateDaysAgo(8), // Antigüedad: 8 días (Muy nuevo)
                unidadId: 2, // ESPECIALIZADO
                unidadNombre: 'ESPECIALIZADO',
                clientId: 1, // REVAL (Config: Excepción Día 1)
                clientNombre: 'REVAL',
                oficinaId: 417,
                oficinaNombre: 'ADMIN ESPECIALIZADA',
                tallas: { camisa: 'L', pantalon: '34', zapatos: '41', chaqueta: 'L', chaleco: 'L' },
                active: 1,
                statusPlanta: 'Activo',
                novedadPlanta: 'Ninguna',
                escenario: 'ELEGIBLE DÍA-1 (Muy nuevo pero cliente tiene Excepción Día-1 activa)',
                yaEntregado: false
            },
            {
                cedula: '999004',
                nombre: 'Ana Martinez',
                cargo: 'Asesor Comercial Transaccional',
                email: 'ana.martinez.test@company.com',
                fechaIngreso: dateDaysAgo(200), // Antigüedad: > 6 meses
                unidadId: 1, // U. TRANSACCIONAL
                unidadNombre: 'U. TRANSACCIONAL',
                clientId: 2, // FUERZA DE VENTA EN CAMPO (Config: Estándar)
                clientNombre: 'FUERZA DE VENTA EN CAMPO',
                oficinaId: 418,
                oficinaNombre: 'ADMIN FUERZA VENTAS',
                tallas: { camisa: 'M', pantalon: '32', zapatos: '39', chaqueta: 'M', chaleco: 'M' },
                active: 1,
                statusPlanta: 'Activo',
                novedadPlanta: 'Ninguna',
                escenario: 'FILTRADO - YA ENTREGADO (Es eligible pero ya se le registró entrega este período)',
                yaEntregado: true
            },
            {
                cedula: '999005',
                nombre: 'Pedro Lopez',
                cargo: 'Cajero Retirado',
                email: 'pedro.lopez.test@company.com',
                fechaIngreso: dateDaysAgo(300),
                unidadId: 1, // U. TRANSACCIONAL
                unidadNombre: 'U. TRANSACCIONAL',
                clientId: 2,
                clientNombre: 'FUERZA DE VENTA EN CAMPO',
                oficinaId: 418,
                oficinaNombre: 'ADMIN FUERZA VENTAS',
                tallas: { camisa: 'XL', pantalon: '36', zapatos: '42', chaqueta: 'XL', chaleco: 'XL' },
                active: 2, // Inactivo en core
                statusPlanta: 'Retirado', // Retirado en planta
                novedadPlanta: 'Retiro definitivo',
                escenario: 'NO ELEGIBLE - RETIRADO (Inactivo con novedades)',
                yaEntregado: false
            }
        ];

        for (const person of testPeople) {
            // 1. Insertar PEOPLE_DETAILS (Tallas)
            const [detailResult] = await conn.execute(`
                INSERT INTO PEOPLE_DETAILS (size_shirt, size_jean, size_shoes, size_jacket, size_vest)
                VALUES (?, ?, ?, ?, ?)
            `, [
                person.tallas.camisa,
                person.tallas.pantalon,
                person.tallas.zapatos,
                person.tallas.chaqueta,
                person.tallas.chaleco
            ]);
            const detailsId = detailResult.insertId;

            // 2. Insertar BUSINESS_PEOPLE_DATA
            const terminationDate = person.active === 2 ? dateDaysAgo(2) : null;
            const [businessResult] = await conn.execute(`
                INSERT INTO BUSINESS_PEOPLE_DATA 
                    (start_date, termination_date, unit_id, client_id, office_id, status_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                person.fechaIngreso,
                terminationDate,
                person.unidadId,
                person.clientId,
                person.oficinaId,
                person.active
            ]);
            const businessId = businessResult.insertId;

            // 3. Insertar PEOPLE
            const names = person.nombre.split(' ');
            const firstName = names[0];
            const lastName = names.slice(1).join(' ');

            const [peopleResult] = await conn.execute(`
                INSERT INTO PEOPLE (document_number, first_name, last_name, email, people_business_id, details_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                person.cedula,
                firstName,
                lastName,
                person.email,
                businessId,
                detailsId
            ]);
            const peopleId = peopleResult.insertId;

            // 4. Insertar en planta_operaciones (SIMULANDO n8n)
            await conn.execute(`
                INSERT INTO planta_operaciones (
                    empleador, cedula, nombre, cargo, correo, fecha_ingreso, contrato, tipo_empleado,
                    unidad_negocio, cliente, oficina, status, novedad, estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'G365 S.A.S',
                person.cedula,
                person.nombre,
                person.cargo,
                person.email,
                person.fechaIngreso,
                'TÉRMINO INDEFINIDO',
                'OPERACIÓN',
                person.unidadNombre,
                person.clientNombre,
                person.oficinaNombre,
                person.statusPlanta,
                person.novedadPlanta,
                person.active === 1 ? 'Activo' : 'Inactivo'
            ]);

            // 5. Si ya se le marcó entrega (para Ana Martinez 999004)
            if (person.yaEntregado) {
                // Insertar una entrega "Entregada" (status_id = 4 en MASTER_STATUS_ENDOWMENT) para el Período 1 de 2026
                const [deliveryResult] = await conn.execute(`
                    INSERT INTO DOTACION_DELIVERY (people_id, unit_id, period_number, period_year, shipping_status, status_id)
                    VALUES (?, ?, 1, 2026, 'ENTREGADO', 4)
                `, [peopleId, person.unidadId]);
                const deliveryId = deliveryResult.insertId;

                // Agregar los detalles de la entrega simulando la talla asignada
                if (itemMap['Camisa']) await conn.execute('INSERT INTO DOTACION_DELIVERY_DETAIL (delivery_id, item_id, size_requested, size_delivered, quantity) VALUES (?, ?, ?, ?, 3)', [deliveryId, itemMap['Camisa'], person.tallas.camisa, person.tallas.camisa]);
                if (itemMap['Pantalón']) await conn.execute('INSERT INTO DOTACION_DELIVERY_DETAIL (delivery_id, item_id, size_requested, size_delivered, quantity) VALUES (?, ?, ?, ?, 3)', [deliveryId, itemMap['Pantalón'], person.tallas.pantalon, person.tallas.pantalon]);
                if (itemMap['Zapatos']) await conn.execute('INSERT INTO DOTACION_DELIVERY_DETAIL (delivery_id, item_id, size_requested, size_delivered, quantity) VALUES (?, ?, ?, ?, 1)', [deliveryId, itemMap['Zapatos'], person.tallas.zapatos, person.tallas.zapatos]);
            }

            console.log(`🔹 Creado: ${person.nombre} (${person.cedula}) - Escenario: ${person.escenario}`);
        }
        console.log('✅ 5 Empleados insertados exitosamente en core y tabla de planta (n8n).');


        // --- 6. DATOS AUXILIARES: ÓRDENES DE COMPRA A PROVEEDORES ---
        console.log('🏭 Creando órdenes de compra ficticias para proveedores...');
        if (itemMap['Camisa'] && itemMap['Zapatos']) {
            // Orden 1: Solicitada (En tránsito / Pendiente)
            await conn.query(`
                INSERT INTO DOTACION_PROVIDER_ORDER (item_id, size, quantity, provider_name, unit_cost, total_cost, status, order_date, expected_date)
                VALUES (?, 'M', 50, 'Textiles Andinos S.A.S', 25000.00, 1250000.00, 'SOLICITADO', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))
            `, [itemMap['Camisa']]);

            // Orden 2: Recibida (Ya ingresó stock)
            await conn.query(`
                INSERT INTO DOTACION_PROVIDER_ORDER (item_id, size, quantity, provider_name, unit_cost, total_cost, status, order_date, expected_date, received_date)
                VALUES (?, '40', 20, 'Calzado Industrial Elite', 48000.00, 960000.00, 'RECIBIDO', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY))
            `, [itemMap['Zapatos']]);
        }
        console.log('✅ Órdenes de compra generadas.');


        // --- 7. DATOS AUXILIARES: ENCUESTAS DE SATISFACCIÓN ---
        console.log('📊 Generando encuestas de satisfacción ficticias...');
        // Registrar encuestas de satisfacción para Ana Martinez (999004) que ya recibió dotación
        const [anaRow] = await conn.query('SELECT people_id FROM PEOPLE WHERE document_number = \'999004\'');
        if (anaRow.length > 0) {
            await conn.query(`
                INSERT INTO DOTACION_SATISFACTION_SURVEY (people_id, period_year, fabric_rating, zipper_rating, comfort_rating, overall_rating, comments)
                VALUES (?, 2026, 5, 4, 5, 5, 'Excelente calidad en las telas. Los pantalones son cómodos y las camisas tienen buen tallaje. Muy conforme.')
            `, [anaRow[0].people_id]);
        }
        console.log('✅ Encuestas de satisfacción generadas.');

        console.log('\n🎉 ¡Poblamiento de datos de Dotación terminado exitosamente! 🎉');
        console.log('\n💡 CASOS DE PRUEBA LISTOS PARA EVALUAR EN EL PANEL DE DOTACIÓN:');
        console.log('1. Juan Perez (CC: 999001) - Aparecerá como ELEGIBLE (antigüedad > 120 días).');
        console.log('2. Maria Rodriguez (CC: 999002) - Aparecerá como NO ELEGIBLE (antigüedad 30 días < 120 días).');
        console.log('3. Carlos Gomez (CC: 999003) - Aparecerá como ELEGIBLE DÍA-1 (antigüedad 8 días, pero el cliente REVAL tiene activa la regla Día-1).');
        console.log('4. Ana Martinez (CC: 999004) - NO aparecerá elegible porque ya tiene una entrega registrada en 2026-Periodo 1. Pero puedes ver sus tallas y su encuesta de satisfacción registrada.');
        console.log('5. Pedro Lopez (CC: 999005) - NO aparecerá elegible ni en listas de activos por estar inactivo/retirado.');
        console.log('\n📌 ADEMÁS:');
        console.log('- Revisa las Alertas en el Dashboard: Verás alertas para "Camisa M" y "Zapatos 40" porque forzamos stock crítico (2 y 1 unidades respectivamente).');
        console.log('- Revisa Compras a Proveedores: Podrás ver órdenes de compra en estado "SOLICITADO" y "RECIBIDO".');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error fatal al poblar la base de datos:', error);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

run();
