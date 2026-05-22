/**
 * Servicio Principal de Dotación
 * Orquesta las operaciones del módulo delegando a modelos y servicios especializados
 */
const MasterDotacionItem = require('../../models/dotacion/masterDotacionItem.model');
const DotacionUnitItem = require('../../models/dotacion/dotacionUnitItem.model');
const DotacionClientConfig = require('../../models/dotacion/dotacionClientConfig.model');
const DotacionInventory = require('../../models/dotacion/dotacionInventory.model');
const DotacionAlertConfig = require('../../models/dotacion/dotacionAlertConfig.model');
const DotacionEligibility = require('./dotacionEligibility.service');
const DotacionInventoryService = require('./dotacionInventory.service');
const DotacionAlertService = require('./dotacionAlert.service');
const DotacionSignatureService = require('./dotacionSignature.service');
const DotacionShippingService = require('./dotacionShipping.service');
const DotacionEmailService = require('./dotacionEmail.service');
const DotacionProviderService = require('./dotacionProvider.service');
const DotacionSatisfactionSurvey = require('../../models/dotacion/dotacionSatisfactionSurvey.model');

const DotacionService = {

    // ─────────────────────────────────────────────────────────────────────────
    // ITEMS (Catálogo de prendas)
    // ─────────────────────────────────────────────────────────────────────────

    async getItems() {
        return await MasterDotacionItem.getAll();
    },

    async getItemById(id) {
        return await MasterDotacionItem.getById(id);
    },

    async createItem(data) {
        return await MasterDotacionItem.create(data);
    },

    async updateItem(id, data) {
        return await MasterDotacionItem.update(id, data);
    },

    async deactivateItem(id) {
        return await MasterDotacionItem.deactivate(id);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // UNIT ITEMS (Prendas por unidad)
    // ─────────────────────────────────────────────────────────────────────────

    async getUnitItems(unitId = null) {
        if (unitId) {
            return await DotacionUnitItem.getByUnit(unitId);
        }
        return await DotacionUnitItem.getAll();
    },

    async assignUnitItem(unitId, itemId, data) {
        return await DotacionUnitItem.assign(unitId, itemId, data);
    },

    async updateUnitItem(id, data) {
        return await DotacionUnitItem.update(id, data);
    },

    async removeUnitItem(id) {
        return await DotacionUnitItem.remove(id);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CLIENT CONFIG (Excepciones día-1)
    // ─────────────────────────────────────────────────────────────────────────

    async getClientConfigs() {
        return await DotacionClientConfig.getAll();
    },

    async getClientConfig(clientId) {
        return await DotacionClientConfig.getByClient(clientId);
    },

    async upsertClientConfig(clientId, requiresDayOne, notes) {
        return await DotacionClientConfig.upsert(clientId, requiresDayOne, notes);
    },

    async removeClientConfig(clientId) {
        return await DotacionClientConfig.remove(clientId);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // INVENTARIO Y KARDEX (Fase 3)
    // ─────────────────────────────────────────────────────────────────────────

    async getInventory() {
        return await DotacionInventory.getAll();
    },

    async getInventoryByItem(itemId) {
        return await DotacionInventory.getByItem(itemId);
    },

    async upsertInventory(itemId, size, quantity, minAlert) {
        return await DotacionInventory.upsert(itemId, size, quantity, minAlert);
    },

    async getLowStock(threshold) {
        return await DotacionInventory.getLowStock(threshold);
    },

    async getKardex(filters) {
        return await DotacionInventoryService.getKardex(filters);
    },

    async manualAdjustment(itemId, size, qty, performedBy, reason) {
        return await DotacionInventoryService.manualAdjustment(itemId, size, qty, performedBy, reason);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ALERTAS (Fase 3)
    // ─────────────────────────────────────────────────────────────────────────

    async getAlertLogs(limit) {
        return await DotacionAlertService.getAlertLogs(limit);
    },

    async resolveAlert(logId, status) {
        return await DotacionAlertService.resolveAlert(logId, status);
    },

    async upsertAlertConfig(article_id, min_quantity, email_to) {
        return await DotacionAlertConfig.upsert({ article_id, min_quantity, email_to });
    },

    async getAlertConfigs() {
        return await DotacionAlertConfig.getAll();
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FIRMA DIGITAL Y LOGÍSTICA (Fase 4)
    // ─────────────────────────────────────────────────────────────────────────

    async generateAndSendSignatureLink(deliveryId, frontendUrl) {
        const token = await DotacionSignatureService.generateToken(deliveryId);
        const delivery = await DotacionSignatureService.validateToken(token);
        return await DotacionEmailService.sendSignatureLink(delivery, token, frontendUrl);
    },

    async validateSignatureToken(token) {
        return await DotacionSignatureService.validateToken(token);
    },

    async saveSignature(token, signatureBase64, ipAddress) {
        return await DotacionSignatureService.saveSignature(token, signatureBase64, ipAddress);
    },

    async updateShippingInfo(deliveryId, shippingData) {
        return await DotacionShippingService.updateShippingInfo(deliveryId, shippingData);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PROVEEDORES (Fase 5)
    // ─────────────────────────────────────────────────────────────────────────

    async createProviderOrder(orderData) {
        return await DotacionProviderService.createOrder(orderData);
    },

    async sendBulkProviderExcel(data) {
        return await DotacionProviderService.sendBulkProviderExcel(data);
    },

    async receiveProviderOrder(orderId, performedBy) {
        return await DotacionProviderService.receiveOrder(orderId, performedBy);
    },

    async getProviderOrders(filters) {
        return await DotacionProviderService.getOrders(filters);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ENCUESTAS (Fase 5)
    // ─────────────────────────────────────────────────────────────────────────

    async submitSurvey(surveyData) {
        return await DotacionSatisfactionSurvey.create(surveyData);
    },

    async getSurveyStats(year) {
        return await DotacionSatisfactionSurvey.getStatsByYear(year);
    },

    async getAllSurveys() {
        return await DotacionSatisfactionSurvey.getAll();
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ELEGIBILIDAD
    // ─────────────────────────────────────────────────────────────────────────

    async getEligiblePeople(periodYear, periodNumber) {
        return await DotacionEligibility.getEligiblePeople(periodYear, periodNumber);
    },

    async checkEligibility(peopleId, periodYear, periodNumber) {
        return await DotacionEligibility.checkEligibility(peopleId, periodYear, periodNumber);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TRASLADOS Y REASIGNACIONES
    // ─────────────────────────────────────────────────────────────────────────

    async registerTraslado(origenId, destinoId, origenNombre, destinoNombre, prendasStr, notas) {
        const pool = require('../../config/db');
        // Ensure table exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS DOTACION_TRASLADOS (
                id INT AUTO_INCREMENT PRIMARY KEY,
                origen_id VARCHAR(50),
                origen_nombre VARCHAR(255),
                destino_id VARCHAR(50),
                destino_nombre VARCHAR(255),
                prendas TEXT,
                notas TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert traslado
        const [result] = await pool.execute(`
            INSERT INTO DOTACION_TRASLADOS (origen_id, origen_nombre, destino_id, destino_nombre, prendas, notas)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [String(origenId), origenNombre, String(destinoId), destinoNombre, prendasStr, notas || '']);
        
        return { success: true, insertId: result.insertId };
    },

    async getTraslados() {
        const pool = require('../../config/db');
        try {
            const [rows] = await pool.query('SELECT * FROM DOTACION_TRASLADOS ORDER BY fecha DESC');
            return rows;
        } catch (err) {
            // Si la tabla no existe aún, retornar vacío en vez de error
            return [];
        }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // HISTORIAL POR PERSONA (Ledger)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retorna lista básica de colaboradores para el buscador del historial.
     * Combina PEOPLE con planta_operaciones para tener estado actualizado.
     */
    async getEmployeesList(search = '') {
        const pool = require('../../config/db');
        let where = "p.status IN ('Activo', 'Inactivo', 'activo', 'inactivo') OR p.status IS NULL";
        const params = [];
        if (search && search.trim()) {
            where = `(CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR p.document_number LIKE ?)`;
            const term = `%${search.trim()}%`;
            params.push(term, term);
        }
        const [rows] = await pool.query(`
            SELECT
                p.people_id,
                p.document_number                            AS cedula,
                CONCAT(p.first_name, ' ', p.last_name)      AS nombre_completo,
                p.first_name,
                p.last_name,
                p.email,
                p.status,
                bpd.start_date,
                mu.name                                      AS unit_name,
                po.cargo,
                po.empresa,
                po.estado                                    AS estado_planta
            FROM PEOPLE p
            LEFT JOIN BUSINESS_PEOPLE_DATA bpd ON p.people_business_id = bpd.people_business_id
            LEFT JOIN MASTER_UNIT mu ON bpd.unit_id = mu.unit_id
            LEFT JOIN planta_operaciones po ON po.cedula = p.document_number
            WHERE ${where}
            ORDER BY p.last_name, p.first_name
            LIMIT 100
        `, params);
        return rows;
    },

    /**
     * Retorna el ledger completo de dotación de un colaborador:
     * perfil + tallas + entregas (con detalles de prendas) + encuestas.
     */
    async getEmployeeLedger(peopleId) {
        const pool = require('../../config/db');

        // 1. Datos de perfil y tallas
        const [profileRows] = await pool.execute(`
            SELECT
                p.people_id,
                p.document_number                            AS cedula,
                CONCAT(p.first_name, ' ', p.last_name)      AS nombre_completo,
                p.first_name,
                p.last_name,
                p.email,
                p.status,
                p.phone,
                bpd.start_date,
                mu.name                                      AS unit_name,
                mu.unit_id,
                pd.shirt_size                                AS talla_camisa,
                pd.pants_size                                AS talla_pantalon,
                pd.shoe_size                                 AS talla_zapato,
                pd.jacket_size                               AS talla_chaqueta,
                po.cargo,
                po.empresa,
                po.cliente,
                po.ciudad,
                po.zona,
                po.regional,
                po.contrato,
                po.estado                                    AS estado_planta,
                po.fecha_ingreso                             AS fecha_ingreso_planta
            FROM PEOPLE p
            LEFT JOIN BUSINESS_PEOPLE_DATA bpd ON p.people_business_id = bpd.people_business_id
            LEFT JOIN MASTER_UNIT mu ON bpd.unit_id = mu.unit_id
            LEFT JOIN PEOPLE_DETAILS pd ON p.details_id = pd.details_id
            LEFT JOIN planta_operaciones po ON po.cedula = p.document_number
            WHERE p.people_id = ?
        `, [peopleId]);

        if (profileRows.length === 0) return null;
        const profile = profileRows[0];

        // 2. Entregas con estado
        const [deliveryRows] = await pool.execute(`
            SELECT
                dd.delivery_id,
                dd.period_number,
                dd.period_year,
                dd.status_id,
                mse.status_endowment                         AS status_name,
                dd.signed_at,
                dd.shipping_guide,
                dd.shipping_carrier,
                dd.shipping_status,
                dd.shipping_date,
                dd.observations,
                dd.created_at,
                mu.name                                      AS unit_name,
                CONCAT(ua.name, ' ', ua.last_name)           AS analyst_name
            FROM DOTACION_DELIVERY dd
            LEFT JOIN MASTER_STATUS_ENDOWMENT mse ON dd.status_id = mse.status_id
            LEFT JOIN MASTER_UNIT mu ON dd.unit_id = mu.unit_id
            LEFT JOIN USERS ua ON dd.analyst_id = ua.user_id
            WHERE dd.people_id = ?
            ORDER BY dd.period_year DESC, dd.period_number ASC
        `, [peopleId]);

        // 3. Detalles de prendas por entrega
        if (deliveryRows.length > 0) {
            const deliveryIds = deliveryRows.map(d => d.delivery_id);
            const placeholders = deliveryIds.map(() => '?').join(',');
            const [detailRows] = await pool.query(`
                SELECT
                    ddd.detail_id,
                    ddd.delivery_id,
                    ddd.item_id,
                    mdi.item_name,
                    mdi.category,
                    ddd.size_requested,
                    ddd.size_delivered,
                    ddd.quantity
                FROM DOTACION_DELIVERY_DETAIL ddd
                JOIN MASTER_DOTACION_ITEM mdi ON ddd.item_id = mdi.item_id
                WHERE ddd.delivery_id IN (${placeholders})
                ORDER BY mdi.category, mdi.item_name
            `, deliveryIds);

            // Mapear detalles a sus entregas
            const detailsByDelivery = {};
            detailRows.forEach(d => {
                if (!detailsByDelivery[d.delivery_id]) detailsByDelivery[d.delivery_id] = [];
                detailsByDelivery[d.delivery_id].push(d);
            });
            deliveryRows.forEach(d => {
                d.details = detailsByDelivery[d.delivery_id] || [];
            });
        }

        // 4. Encuestas de satisfacción
        let surveys = [];
        try {
            const [surveyRows] = await pool.execute(`
                SELECT
                    s.survey_id,
                    s.delivery_id,
                    s.rating,
                    s.comments,
                    s.submitted_at
                FROM DOTACION_SATISFACTION_SURVEY s
                WHERE s.people_id = ?
                ORDER BY s.submitted_at DESC
            `, [peopleId]);
            surveys = surveyRows;
        } catch (e) {
            // La tabla puede no existir en algunos entornos
            surveys = [];
        }

        return {
            profile,
            deliveries: deliveryRows,
            surveys
        };
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD / ESTADÍSTICAS
    // ─────────────────────────────────────────────────────────────────────────

    async getDashboardStats(periodYear, periodNumber) {
        const [eligible, inventory, lowStock, surveyStats] = await Promise.all([
            DotacionEligibility.getEligiblePeople(periodYear, periodNumber),
            DotacionInventory.getAll(),
            DotacionInventory.getLowStock(),
            DotacionSatisfactionSurvey.getStatsByYear(periodYear)
        ]);

        const eligibilityStats = await DotacionEligibility.getStats(periodYear, periodNumber);

        return {
            eligibility: {
                ...eligibilityStats,
                people_list: eligible.slice(0, 50) // Muestra hasta 50 para el dashboard
            },
            inventory_summary: {
                total_items: inventory.length,
                total_stock: inventory.reduce((sum, i) => sum + i.quantity_available, 0),
                low_stock_alerts: lowStock.length
            },
            low_stock_items: lowStock,
            survey_summary: surveyStats
        };
    }
};

module.exports = DotacionService;
