/**
 * Script de Migración — Módulo de Dotación (Fase 1)
 * Crea las 11 tablas nuevas y puebla datos iniciales.
 * 
 * Ejecución: node scripts/create_dotacion_tables.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    console.log('🔧 Iniciando migración del módulo de Dotación...\n');

    // ─────────────────────────────────────────────────────────────────────────
    // 1. MASTER_DOTACION_ITEM — Catálogo de prendas
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS MASTER_DOTACION_ITEM (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            item_name VARCHAR(100) NOT NULL,
            category VARCHAR(50),
            status_id INT DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_mdi_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
        )
    `);
    console.log('✅ Tabla MASTER_DOTACION_ITEM creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 2. MASTER_STATUS_ENDOWMENT — Poblar estados (tabla ya existe)
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS MASTER_STATUS_ENDOWMENT (
            status_id INT AUTO_INCREMENT PRIMARY KEY,
            status_endowment VARCHAR(50) UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tabla MASTER_STATUS_ENDOWMENT verificada');

    // ─────────────────────────────────────────────────────────────────────────
    // 3. DOTACION_CLIENT_CONFIG — Excepciones día-1 por cliente
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_CLIENT_CONFIG (
            config_id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            requires_day_one TINYINT(1) DEFAULT 0,
            notes VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_dcc_client FOREIGN KEY (client_id) REFERENCES MASTER_CLIENT(client_id),
            UNIQUE KEY uq_client_config (client_id)
        )
    `);
    console.log('✅ Tabla DOTACION_CLIENT_CONFIG creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 4. DOTACION_UNIT_ITEM — Qué prendas van por unidad
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_UNIT_ITEM (
            unit_item_id INT AUTO_INCREMENT PRIMARY KEY,
            unit_id INT NOT NULL,
            item_id INT NOT NULL,
            custom_description VARCHAR(200),
            quantity_per_delivery INT DEFAULT 1,
            status_id INT DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_dui_unit FOREIGN KEY (unit_id) REFERENCES MASTER_UNIT(unit_id),
            CONSTRAINT fk_dui_item FOREIGN KEY (item_id) REFERENCES MASTER_DOTACION_ITEM(item_id),
            CONSTRAINT fk_dui_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id),
            UNIQUE KEY uq_unit_item (unit_id, item_id)
        )
    `);
    console.log('✅ Tabla DOTACION_UNIT_ITEM creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 5. DOTACION_PLAN_ANUAL — Plan anual del líder
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_PLAN_ANUAL (
            plan_id INT AUTO_INCREMENT PRIMARY KEY,
            plan_year INT NOT NULL,
            leader_id INT NOT NULL,
            unit_id INT,
            status_id INT DEFAULT 1,
            total_people INT DEFAULT 0,
            observations TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_dpa_leader FOREIGN KEY (leader_id) REFERENCES USERS(user_id),
            CONSTRAINT fk_dpa_unit FOREIGN KEY (unit_id) REFERENCES MASTER_UNIT(unit_id),
            CONSTRAINT fk_dpa_status FOREIGN KEY (status_id) REFERENCES MASTER_STATUS_ENDOWMENT(status_id)
        )
    `);
    console.log('✅ Tabla DOTACION_PLAN_ANUAL creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 6. DOTACION_PLAN_PERSONA — Personas incluidas en plan
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_PLAN_PERSONA (
            plan_persona_id INT AUTO_INCREMENT PRIMARY KEY,
            plan_id INT NOT NULL,
            people_id INT NOT NULL,
            unit_id_at_plan INT,
            is_day_one TINYINT(1) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'INCLUIDO',
            notes VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_dpp_plan FOREIGN KEY (plan_id) REFERENCES DOTACION_PLAN_ANUAL(plan_id),
            CONSTRAINT fk_dpp_people FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id),
            UNIQUE KEY uq_plan_person (plan_id, people_id)
        )
    `);
    console.log('✅ Tabla DOTACION_PLAN_PERSONA creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 7. DOTACION_DELIVERY — Entregas (×3/año/persona)
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_DELIVERY (
            delivery_id INT AUTO_INCREMENT PRIMARY KEY,
            plan_id INT,
            people_id INT NOT NULL,
            unit_id INT,
            period_number TINYINT NOT NULL COMMENT '1=Abril, 2=Agosto, 3=Nov-Dic',
            period_year INT NOT NULL,
            analyst_id INT,
            
            shipping_guide VARCHAR(100),
            shipping_carrier VARCHAR(100),
            shipping_status VARCHAR(50) DEFAULT 'PENDIENTE',
            shipping_date DATETIME,
            
            signature_token VARCHAR(100) UNIQUE,
            digital_signature TEXT,
            signed_at DATETIME,
            signature_ip VARCHAR(45),
            
            status_id INT DEFAULT 1,
            observations TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            CONSTRAINT fk_dd_plan FOREIGN KEY (plan_id) REFERENCES DOTACION_PLAN_ANUAL(plan_id),
            CONSTRAINT fk_dd_people FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id),
            CONSTRAINT fk_dd_unit FOREIGN KEY (unit_id) REFERENCES MASTER_UNIT(unit_id),
            CONSTRAINT fk_dd_analyst FOREIGN KEY (analyst_id) REFERENCES USERS(user_id),
            CONSTRAINT fk_dd_status FOREIGN KEY (status_id) REFERENCES MASTER_STATUS_ENDOWMENT(status_id),
            
            UNIQUE KEY uq_person_period (people_id, period_year, period_number)
        )
    `);
    console.log('✅ Tabla DOTACION_DELIVERY creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 8. DOTACION_DELIVERY_DETAIL — Items de cada entrega
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_DELIVERY_DETAIL (
            detail_id INT AUTO_INCREMENT PRIMARY KEY,
            delivery_id INT NOT NULL,
            item_id INT NOT NULL,
            size_requested VARCHAR(10),
            size_delivered VARCHAR(10),
            quantity INT DEFAULT 1,
            CONSTRAINT fk_ddd_delivery FOREIGN KEY (delivery_id) REFERENCES DOTACION_DELIVERY(delivery_id) ON DELETE CASCADE,
            CONSTRAINT fk_ddd_item FOREIGN KEY (item_id) REFERENCES MASTER_DOTACION_ITEM(item_id)
        )
    `);
    console.log('✅ Tabla DOTACION_DELIVERY_DETAIL creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 9. DOTACION_INVENTORY — Stock por item+talla
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_INVENTORY (
            inventory_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            size VARCHAR(10) NOT NULL,
            quantity_available INT DEFAULT 0,
            quantity_reserved INT DEFAULT 0,
            min_stock_alert INT DEFAULT 5,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_di_item FOREIGN KEY (item_id) REFERENCES MASTER_DOTACION_ITEM(item_id),
            UNIQUE KEY uq_item_size (item_id, size)
        )
    `);
    console.log('✅ Tabla DOTACION_INVENTORY creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 10. DOTACION_INVENTORY_MOVEMENT — Kardex
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_INVENTORY_MOVEMENT (
            movement_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            size VARCHAR(10) NOT NULL,
            movement_type ENUM('ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION', 'REASIGNACION') NOT NULL,
            quantity INT NOT NULL,
            delivery_id INT,
            performed_by INT,
            reference_note VARCHAR(255),
            movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_dim_item FOREIGN KEY (item_id) REFERENCES MASTER_DOTACION_ITEM(item_id),
            CONSTRAINT fk_dim_delivery FOREIGN KEY (delivery_id) REFERENCES DOTACION_DELIVERY(delivery_id),
            CONSTRAINT fk_dim_user FOREIGN KEY (performed_by) REFERENCES USERS(user_id)
        )
    `);
    console.log('✅ Tabla DOTACION_INVENTORY_MOVEMENT creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 11. DOTACION_PROVIDER_ORDER — Pedidos a proveedor
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_PROVIDER_ORDER (
            order_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            size VARCHAR(10) NOT NULL,
            quantity INT NOT NULL,
            provider_name VARCHAR(150),
            unit_cost DECIMAL(12,2),
            total_cost DECIMAL(12,2),
            delivery_id INT,
            status VARCHAR(30) DEFAULT 'SOLICITADO',
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            expected_date DATETIME,
            received_date DATETIME,
            CONSTRAINT fk_dpo_item FOREIGN KEY (item_id) REFERENCES MASTER_DOTACION_ITEM(item_id),
            CONSTRAINT fk_dpo_delivery FOREIGN KEY (delivery_id) REFERENCES DOTACION_DELIVERY(delivery_id)
        )
    `);
    console.log('✅ Tabla DOTACION_PROVIDER_ORDER creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 12. DOTACION_SATISFACTION_SURVEY — Encuesta de satisfacción
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_SATISFACTION_SURVEY (
            survey_id INT AUTO_INCREMENT PRIMARY KEY,
            people_id INT NOT NULL,
            period_year INT NOT NULL,
            fabric_rating TINYINT,
            zipper_rating TINYINT,
            comfort_rating TINYINT,
            overall_rating TINYINT,
            comments TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_dss_people FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id),
            UNIQUE KEY uq_survey_year (people_id, period_year)
        )
    `);
    // ─────────────────────────────────────────────────────────────────────────
    // 13. DOTACION_ALERT_CONFIG — Umbrales de alerta
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_ALERT_CONFIG (
            article_id INT PRIMARY KEY,
            min_quantity INT NOT NULL DEFAULT 5,
            email_to VARCHAR(255),
            CONSTRAINT fk_dac_item FOREIGN KEY (article_id) REFERENCES MASTER_DOTACION_ITEM(item_id)
        )
    `);
    console.log('✅ Tabla DOTACION_ALERT_CONFIG creada');

    // ─────────────────────────────────────────────────────────────────────────
    // 14. DOTACION_ALERT_LOG — Historial de alertas generadas
    // ─────────────────────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS DOTACION_ALERT_LOG (
            log_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            size VARCHAR(10) NOT NULL,
            quantity_at_alert INT NOT NULL,
            min_threshold INT NOT NULL,
            status VARCHAR(20) DEFAULT 'PENDIENTE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_dal_item FOREIGN KEY (item_id) REFERENCES MASTER_DOTACION_ITEM(item_id)
        )
    `);
    console.log('✅ Tabla DOTACION_ALERT_LOG creada');


    // ═════════════════════════════════════════════════════════════════════════
    // DATOS INICIALES
    // ═════════════════════════════════════════════════════════════════════════

    console.log('\n📦 Poblando datos iniciales...\n');

    // Estados de dotación
    await conn.query(`
        INSERT IGNORE INTO MASTER_STATUS_ENDOWMENT (status_endowment) VALUES
        ('Pendiente'),
        ('Aprobado'),
        ('En Preparación'),
        ('Entregado'),
        ('Firmado'),
        ('Rechazado'),
        ('Devuelto Parcial'),
        ('Cancelado')
    `);
    console.log('✅ MASTER_STATUS_ENDOWMENT poblada (8 estados)');

    // Catálogo de prendas
    await conn.query(`
        INSERT IGNORE INTO MASTER_DOTACION_ITEM (item_name, category, status_id) VALUES
        ('Camisa', 'Superior', 1),
        ('Pantalón', 'Inferior', 1),
        ('Zapatos', 'Calzado', 1),
        ('Chaqueta', 'Superior', 1),
        ('Chaleco', 'Superior', 1)
    `);
    console.log('✅ MASTER_DOTACION_ITEM poblada (5 prendas)');

    // Mapeo de prendas por unidad
    // Primero obtener IDs de unidades
    const [units] = await conn.query(`SELECT unit_id, name FROM MASTER_UNIT`);
    const transaccional = units.find(u => u.name.toLowerCase().includes('transaccional'));
    const especializada = units.find(u => u.name.toLowerCase().includes('especializada'));

    // Obtener IDs de items
    const [items] = await conn.query(`SELECT item_id, item_name FROM MASTER_DOTACION_ITEM`);
    const getItemId = (name) => items.find(i => i.item_name.toLowerCase() === name.toLowerCase())?.item_id;

    if (transaccional) {
        const tId = transaccional.unit_id;
        // Transaccional: todas las prendas estándar
        for (const item of items) {
            await conn.query(`
                INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery)
                VALUES (?, ?, 1)
            `, [tId, item.item_id]);
        }
        console.log(`✅ DOTACION_UNIT_ITEM: Transaccional (unit_id=${tId}) → ${items.length} prendas`);
    }

    if (especializada) {
        const eId = especializada.unit_id;
        // Especializada (Bancos): Camisa corporativa(2), Pantalón(1), Zapatos(1)
        const camisaId = getItemId('Camisa');
        const pantalonId = getItemId('Pantalón');
        const zapatosId = getItemId('Zapatos');

        if (camisaId) await conn.query(`INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, custom_description, quantity_per_delivery) VALUES (?, ?, 'Camisa corporativa banco', 2)`, [eId, camisaId]);
        if (pantalonId) await conn.query(`INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (?, ?, 1)`, [eId, pantalonId]);
        if (zapatosId) await conn.query(`INSERT IGNORE INTO DOTACION_UNIT_ITEM (unit_id, item_id, quantity_per_delivery) VALUES (?, ?, 1)`, [eId, zapatosId]);

        console.log(`✅ DOTACION_UNIT_ITEM: Especializada (unit_id=${eId}) → 3 prendas`);
    }

    // Registrar página DOTACION en el sistema de permisos
    await conn.query(`
        INSERT IGNORE INTO pages (page_code, page_name, route, description, status_page)
        VALUES ('DOTACION', 'Dotación', '/dotacion', 'Gestión de dotación de personal', 1)
    `);

    // Dar acceso al Gerente (role_id = 1)
    await conn.query(`
        INSERT IGNORE INTO role_pages (role_id, page_code, can_view, can_edit)
        VALUES (1, 'DOTACION', 1, 1)
    `);
    console.log('✅ Page code DOTACION registrada con permisos para Gerente');

    console.log('\n🎉 Migración del módulo de Dotación completada exitosamente!\n');

    await conn.end();
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Error en migración:', err);
    process.exit(1);
});
