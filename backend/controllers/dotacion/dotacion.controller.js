/**
 * Controller de Dotación — Fase 1 + Fase 2
 * CRUD de maestras, configuración, elegibilidad, planes anuales y entregas
 */
const DotacionService = require('../../services/dotacion/dotacion.service');
const DotacionPlanService = require('../../services/dotacion/dotacionPlan.service');
const DotacionDeliveryService = require('../../services/dotacion/dotacionDelivery.service');

// ═══════════════════════════════════════════════════════════════════════════
// ITEMS (Catálogo de prendas)
// ═══════════════════════════════════════════════════════════════════════════

const getItems = async (req, res) => {
    try {
        const data = await DotacionService.getItems();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getItems:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createItem = async (req, res) => {
    try {
        const { item_name, category } = req.body;
        if (!item_name) {
            return res.status(400).json({ success: false, message: 'El nombre de la prenda es requerido' });
        }
        const data = await DotacionService.createItem({ item_name, category });
        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error createItem:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await DotacionService.updateItem(id, req.body);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Prenda no encontrada' });
        }
        return res.status(200).json({ success: true, message: 'Prenda actualizada' });
    } catch (error) {
        console.error('Error updateItem:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// UNIT ITEMS (Prendas por unidad)
// ═══════════════════════════════════════════════════════════════════════════

const getUnitItems = async (req, res) => {
    try {
        const unitId = req.params.unitId || null;
        const data = await DotacionService.getUnitItems(unitId);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getUnitItems:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const assignUnitItem = async (req, res) => {
    try {
        const { unit_id, item_id, custom_description, quantity_per_delivery } = req.body;
        if (!unit_id || !item_id) {
            return res.status(400).json({ success: false, message: 'unit_id e item_id son requeridos' });
        }
        const data = await DotacionService.assignUnitItem(unit_id, item_id, {
            custom_description,
            quantity_per_delivery
        });
        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error assignUnitItem:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT CONFIG (Excepciones día-1)
// ═══════════════════════════════════════════════════════════════════════════

const getClientConfigs = async (req, res) => {
    try {
        const data = await DotacionService.getClientConfigs();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getClientConfigs:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const upsertClientConfig = async (req, res) => {
    try {
        const { client_id, requires_day_one, notes } = req.body;
        if (!client_id) {
            return res.status(400).json({ success: false, message: 'client_id es requerido' });
        }
        const data = await DotacionService.upsertClientConfig(client_id, requires_day_one, notes);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error upsertClientConfig:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INVENTARIO
// ═══════════════════════════════════════════════════════════════════════════

const getInventory = async (req, res) => {
    try {
        const data = await DotacionService.getInventory();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getInventory:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const upsertInventory = async (req, res) => {
    try {
        const { item_id, size, quantity_available, min_stock_alert } = req.body;
        if (!item_id || !size) {
            return res.status(400).json({ success: false, message: 'item_id y size son requeridos' });
        }
        const data = await DotacionService.upsertInventory(item_id, size, quantity_available, min_stock_alert);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error upsertInventory:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getLowStock = async (req, res) => {
    try {
        const threshold = req.query.threshold ? parseInt(req.query.threshold) : null;
        const data = await DotacionService.getLowStock(threshold);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getLowStock:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ELEGIBILIDAD
// ═══════════════════════════════════════════════════════════════════════════

const getEligiblePeople = async (req, res) => {
    try {
        const { year, period } = req.params;
        if (!year || !period) {
            return res.status(400).json({ success: false, message: 'year y period son requeridos' });
        }
        const data = await DotacionService.getEligiblePeople(parseInt(year), parseInt(period));
        return res.status(200).json({ success: true, data, total: data.length });
    } catch (error) {
        console.error('Error getEligiblePeople:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const checkEligibility = async (req, res) => {
    try {
        const { peopleId, year, period } = req.params;
        const result = await DotacionService.checkEligibility(
            parseInt(peopleId), parseInt(year), parseInt(period)
        );
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error('Error checkEligibility:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

const getDashboardStats = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const period = req.query.period || DotacionService.getCurrentPeriod?.() || 1;
        const data = await DotacionService.getDashboardStats(parseInt(year), parseInt(period));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getDashboardStats:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PLANES ANUALES (Fase 2)
// ═══════════════════════════════════════════════════════════════════════════

const getPlans = async (req, res) => {
    try {
        const filters = {
            year: req.query.year ? parseInt(req.query.year) : null,
            leader_id: req.query.leader_id ? parseInt(req.query.leader_id) : null,
            unit_id: req.query.unit_id ? parseInt(req.query.unit_id) : null,
            status_id: req.query.status_id ? parseInt(req.query.status_id) : null
        };
        const data = await DotacionPlanService.getPlans(filters);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getPlans:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPlanById = async (req, res) => {
    try {
        const data = await DotacionPlanService.getPlanWithPeople(parseInt(req.params.id));
        if (!data) return res.status(404).json({ success: false, message: 'Plan no encontrado' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getPlanById:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createPlan = async (req, res) => {
    try {
        const { leader_id, unit_id, year, observations } = req.body;
        if (!leader_id || !year) {
            return res.status(400).json({ success: false, message: 'leader_id y year son requeridos' });
        }
        const data = await DotacionPlanService.createPlanWithEligible(
            parseInt(leader_id), unit_id ? parseInt(unit_id) : null, parseInt(year), observations
        );
        const statusCode = data.success ? 201 : 409;
        return res.status(statusCode).json(data);
    } catch (error) {
        console.error('Error createPlan:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updatePlanStatus = async (req, res) => {
    try {
        const { status_id } = req.body;
        if (!status_id) return res.status(400).json({ success: false, message: 'status_id es requerido' });
        const data = await DotacionPlanService.updatePlanStatus(parseInt(req.params.id), parseInt(status_id));
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error updatePlanStatus:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const addPersonToPlan = async (req, res) => {
    try {
        const { people_id, unit_id_at_plan, is_day_one, notes } = req.body;
        if (!people_id) return res.status(400).json({ success: false, message: 'people_id es requerido' });
        const data = await DotacionPlanService.addPersonToPlan(
            parseInt(req.params.id), parseInt(people_id), { unit_id_at_plan, is_day_one, notes }
        );
        return res.status(201).json(data);
    } catch (error) {
        console.error('Error addPersonToPlan:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const markPersonRetired = async (req, res) => {
    try {
        const peopleId = parseInt(req.params.id);
        const year = req.body.year || new Date().getFullYear();
        const data = await DotacionPlanService.handleRetirement(peopleId, parseInt(year));
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error markPersonRetired:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const handleRotation = async (req, res) => {
    try {
        const { plan_id, new_unit_id } = req.body;
        if (!plan_id || !new_unit_id) {
            return res.status(400).json({ success: false, message: 'plan_id y new_unit_id son requeridos' });
        }
        const data = await DotacionPlanService.handleRotation(
            parseInt(req.params.id), parseInt(plan_id), parseInt(new_unit_id)
        );
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error handleRotation:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTREGAS (Fase 2)
// ═══════════════════════════════════════════════════════════════════════════

const getDeliveries = async (req, res) => {
    try {
        const filters = {
            year: req.query.year ? parseInt(req.query.year) : null,
            period: req.query.period ? parseInt(req.query.period) : null,
            status_id: req.query.status_id ? parseInt(req.query.status_id) : null,
            unit_id: req.query.unit_id ? parseInt(req.query.unit_id) : null,
            plan_id: req.query.plan_id ? parseInt(req.query.plan_id) : null
        };
        const data = await DotacionDeliveryService.getDeliveries(filters);
        return res.status(200).json({ success: true, data, total: data.length });
    } catch (error) {
        console.error('Error getDeliveries:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getDeliveryById = async (req, res) => {
    try {
        const data = await DotacionDeliveryService.getDeliveryById(parseInt(req.params.id));
        if (!data) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getDeliveryById:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const generateDeliveries = async (req, res) => {
    try {
        const { plan_id, period_number, analyst_id } = req.body;
        if (!plan_id || !period_number) {
            return res.status(400).json({ success: false, message: 'plan_id y period_number son requeridos' });
        }
        const data = await DotacionDeliveryService.generateDeliveriesFromPlan(
            parseInt(plan_id), parseInt(period_number), analyst_id ? parseInt(analyst_id) : null
        );
        return res.status(201).json(data);
    } catch (error) {
        console.error('Error generateDeliveries:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateDeliverySizes = async (req, res) => {
    try {
        const data = await DotacionDeliveryService.updateSizesPreDelivery(
            parseInt(req.params.id), req.body
        );
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error updateDeliverySizes:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const processDelivery = async (req, res) => {
    try {
        const performedBy = req.user?.user_id || req.body.performed_by || null;
        const data = await DotacionDeliveryService.processDelivery(
            parseInt(req.params.id), performedBy
        );
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error processDelivery:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPersonDeliveries = async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : null;
        const data = await DotacionDeliveryService.getPersonDeliveries(
            parseInt(req.params.peopleId), year
        );
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getPersonDeliveries:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// KARDEX E INVENTARIO (Fase 3)
// ═══════════════════════════════════════════════════════════════════════════

const getKardex = async (req, res) => {
    try {
        const filters = {
            item_id: req.query.item_id ? parseInt(req.query.item_id) : null,
            size: req.query.size,
            type: req.query.type,
            start_date: req.query.start_date,
            end_date: req.query.end_date
        };
        const data = await DotacionService.getKardex(filters);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getKardex:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const manualAdjustment = async (req, res) => {
    try {
        const { item_id, size, quantity, reason } = req.body;
        const performedBy = req.user?.user_id || req.body.performed_by || null;

        if (!item_id || !size || quantity === undefined) {
            return res.status(400).json({ success: false, message: 'item_id, size y quantity son requeridos' });
        }

        const data = await DotacionService.manualAdjustment(
            parseInt(item_id), size, parseInt(quantity), performedBy, reason
        );
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error manualAdjustment:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ALERTAS (Fase 3)
// ═══════════════════════════════════════════════════════════════════════════

const getAlertLogs = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        const data = await DotacionService.getAlertLogs(limit);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getAlertLogs:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const resolveAlert = async (req, res) => {
    try {
        const { status } = req.body;
        const data = await DotacionService.resolveAlert(parseInt(req.params.id), status);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error resolveAlert:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAlertConfigs = async (req, res) => {
    try {
        const data = await DotacionService.getAlertConfigs();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getAlertConfigs:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const upsertAlertConfig = async (req, res) => {
    try {
        const { article_id, min_quantity, email_to } = req.body;
        if (!article_id || min_quantity === undefined) {
            return res.status(400).json({ success: false, message: 'article_id y min_quantity son requeridos' });
        }
        const data = await DotacionService.upsertAlertConfig(parseInt(article_id), parseInt(min_quantity), email_to);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error upsertAlertConfig:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// FIRMA DIGITAL Y ENVÍO (Fase 4)
// ═══════════════════════════════════════════════════════════════════════════

const sendSignatureEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const frontendUrl = req.body.frontend_url || process.env.FRONTEND_URL || 'http://localhost:3000';
        const result = await DotacionService.generateAndSendSignatureLink(parseInt(id), frontendUrl);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error sendSignatureEmail:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const validateSignatureToken = async (req, res) => {
    try {
        const { token } = req.params;
        const data = await DotacionService.validateSignatureToken(token);
        if (!data) return res.status(404).json({ success: false, message: 'Token inválido o expirado' });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error validateSignatureToken:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const submitSignature = async (req, res) => {
    try {
        const { token } = req.params;
        const { signature_base64 } = req.body;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!signature_base64) {
            return res.status(400).json({ success: false, message: 'La firma es requerida' });
        }

        const result = await DotacionService.saveSignature(token, signature_base64, ipAddress);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error submitSignature:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateShippingInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await DotacionService.updateShippingInfo(parseInt(id), req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updateShippingInfo:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PROVEEDORES (Fase 5)
// ═══════════════════════════════════════════════════════════════════════════

const getProviderOrders = async (req, res) => {
    try {
        const data = await DotacionService.getProviderOrders(req.query);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getProviderOrders:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createProviderOrder = async (req, res) => {
    try {
        const data = await DotacionService.createProviderOrder(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error createProviderOrder:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const sendBulkProviderExcel = async (req, res) => {
    try {
        const result = await DotacionService.sendBulkProviderExcel(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error sendBulkProviderExcel:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const receiveProviderOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const performedBy = req.user?.user_id || req.body.performed_by || null;
        const result = await DotacionService.receiveProviderOrder(parseInt(id), performedBy);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error receiveProviderOrder:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ENCUESTAS (Fase 5)
// ═══════════════════════════════════════════════════════════════════════════

const submitSurvey = async (req, res) => {
    try {
        // En un entorno real, el people_id vendría del token del empleado
        const data = await DotacionService.submitSurvey(req.body);
        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error submitSurvey:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSurveyStats = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const data = await DotacionService.getSurveyStats(parseInt(year));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getSurveyStats:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllSurveys = async (req, res) => {
    try {
        const data = await DotacionService.getAllSurveys();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getAllSurveys:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const registerTraslado = async (req, res) => {
    try {
        const { origenId, destinoId, origenNombre, destinoNombre, prendas, notas } = req.body;
        if (!origenId || !destinoId) {
            return res.status(400).json({ success: false, message: 'Se requiere origen y destino' });
        }
        const result = await DotacionService.registerTraslado(origenId, destinoId, origenNombre, destinoNombre, prendas, notas);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error registerTraslado:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTraslados = async (req, res) => {
    try {
        const data = await DotacionService.getTraslados();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getTraslados:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// HISTORIAL POR PERSONA (Ledger)
// ═══════════════════════════════════════════════════════════════════════════

const getEmployeesList = async (req, res) => {
    try {
        const search = req.query.search || '';
        const data = await DotacionService.getEmployeesList(search);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getEmployeesList:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getEmployeeLedger = async (req, res) => {
    try {
        const peopleId = parseInt(req.params.peopleId);
        if (!peopleId || isNaN(peopleId)) {
            return res.status(400).json({ success: false, message: 'peopleId inválido' });
        }
        const data = await DotacionService.getEmployeeLedger(peopleId);
        if (!data) {
            return res.status(404).json({ success: false, message: 'Colaborador no encontrado' });
        }
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error getEmployeeLedger:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    // Fase 1
    getItems,
    createItem,
    updateItem,
    getUnitItems,
    assignUnitItem,
    getClientConfigs,
    upsertClientConfig,
    getInventory,
    upsertInventory,
    getLowStock,
    getEligiblePeople,
    checkEligibility,
    getDashboardStats,
    // Fase 2 — Planes
    getPlans,
    getPlanById,
    createPlan,
    updatePlanStatus,
    addPersonToPlan,
    markPersonRetired,
    handleRotation,
    // Fase 2 — Entregas
    getDeliveries,
    getDeliveryById,
    generateDeliveries,
    updateDeliverySizes,
    processDelivery,
    getPersonDeliveries,
    // Fase 3 — Inventario / Kardex
    getKardex,
    manualAdjustment,
    // Fase 3 — Alertas
    getAlertLogs,
    resolveAlert,
    getAlertConfigs,
    upsertAlertConfig,
    // Fase 4 — Firma y Envío
    sendSignatureEmail,
    validateSignatureToken,
    submitSignature,
    updateShippingInfo,
    // Fase 5 — Proveedores
    getProviderOrders,
    createProviderOrder,
    sendBulkProviderExcel,
    receiveProviderOrder,
    // Fase 5 — Encuestas
    submitSurvey,
    getSurveyStats,
    getAllSurveys,
    // Traslados y Reasignaciones
    registerTraslado,
    getTraslados,
    // Historial por Persona
    getEmployeesList,
    getEmployeeLedger
};



