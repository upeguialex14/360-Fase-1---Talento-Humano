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
