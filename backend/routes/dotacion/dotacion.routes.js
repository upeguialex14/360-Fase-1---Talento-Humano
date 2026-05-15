/**
 * Rutas del Módulo de Dotación — Full Stack (Fases 1 a 5)
 * Gestión de catálogo, inventario, planes, entregas, firmas, proveedores y encuestas.
 */
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/dotacion/dotacion.controller');
const verifyToken = require('../../middleware/auth.middleware');
const { checkPageAccess } = require('../../middleware/permission.middleware');

// ─────────────────────────────────────────────────────────────────────────
// RUTAS PÚBLICAS (No requieren autenticación)
// ─────────────────────────────────────────────────────────────────────────
router.get('/public/sign/:token', controller.validateSignatureToken);
router.post('/public/sign/:token', controller.submitSignature);
router.post('/public/survey', controller.submitSurvey);

// Todas las demás rutas requieren autenticación
router.use(verifyToken);

// ─────────────────────────────────────────────────────────────────────────
// ITEMS (Catálogo de prendas)
// ─────────────────────────────────────────────────────────────────────────
router.get('/items', checkPageAccess('DOTACION', 'can_view'), controller.getItems);
router.post('/items', checkPageAccess('DOTACION', 'can_edit'), controller.createItem);
router.put('/items/:id', checkPageAccess('DOTACION', 'can_edit'), controller.updateItem);

// ─────────────────────────────────────────────────────────────────────────
// UNIT ITEMS (Prendas por unidad)
// ─────────────────────────────────────────────────────────────────────────
router.get('/unit-items', checkPageAccess('DOTACION', 'can_view'), controller.getUnitItems);
router.get('/unit-items/:unitId', checkPageAccess('DOTACION', 'can_view'), controller.getUnitItems);
router.post('/unit-items', checkPageAccess('DOTACION', 'can_edit'), controller.assignUnitItem);

// ─────────────────────────────────────────────────────────────────────────
// CLIENT CONFIG (Excepciones día-1)
// ─────────────────────────────────────────────────────────────────────────
router.get('/client-config', checkPageAccess('DOTACION', 'can_view'), controller.getClientConfigs);
router.post('/client-config', checkPageAccess('DOTACION', 'can_edit'), controller.upsertClientConfig);

// ─────────────────────────────────────────────────────────────────────────
// INVENTARIO Y KARDEX
// ─────────────────────────────────────────────────────────────────────────
router.get('/inventory', checkPageAccess('DOTACION', 'can_view'), controller.getInventory);
router.post('/inventory', checkPageAccess('DOTACION', 'can_edit'), controller.upsertInventory);
router.get('/inventory/low-stock', checkPageAccess('DOTACION', 'can_view'), controller.getLowStock);
router.get('/kardex', checkPageAccess('DOTACION', 'can_view'), controller.getKardex);
router.post('/inventory/adjust', checkPageAccess('DOTACION', 'can_edit'), controller.manualAdjustment);

// ─────────────────────────────────────────────────────────────────────────
// ALERTAS DE STOCK
// ─────────────────────────────────────────────────────────────────────────
router.get('/alerts/logs', checkPageAccess('DOTACION', 'can_view'), controller.getAlertLogs);
router.put('/alerts/logs/:id/resolve', checkPageAccess('DOTACION', 'can_edit'), controller.resolveAlert);
router.get('/alerts/config', checkPageAccess('DOTACION', 'can_view'), controller.getAlertConfigs);
router.post('/alerts/config', checkPageAccess('DOTACION', 'can_edit'), controller.upsertAlertConfig);

// ─────────────────────────────────────────────────────────────────────────
// ELEGIBILIDAD
// ─────────────────────────────────────────────────────────────────────────
router.get('/eligible/:year/:period', checkPageAccess('DOTACION', 'can_view'), controller.getEligiblePeople);
router.get('/eligible/check/:peopleId/:year/:period', checkPageAccess('DOTACION', 'can_view'), controller.checkEligibility);

// ─────────────────────────────────────────────────────────────────────────
// PLANES ANUALES
// ─────────────────────────────────────────────────────────────────────────
router.get('/plans', checkPageAccess('DOTACION', 'can_view'), controller.getPlans);
router.get('/plans/:id', checkPageAccess('DOTACION', 'can_view'), controller.getPlanById);
router.post('/plans', checkPageAccess('DOTACION', 'can_edit'), controller.createPlan);
router.put('/plans/:id/status', checkPageAccess('DOTACION', 'can_edit'), controller.updatePlanStatus);
router.post('/plans/:id/people', checkPageAccess('DOTACION', 'can_edit'), controller.addPersonToPlan);
router.put('/plans/people/:id/retire', checkPageAccess('DOTACION', 'can_edit'), controller.markPersonRetired);
router.put('/plans/people/:id/rotate', checkPageAccess('DOTACION', 'can_edit'), controller.handleRotation);

// ─────────────────────────────────────────────────────────────────────────
// ENTREGAS
// ─────────────────────────────────────────────────────────────────────────
router.get('/deliveries', checkPageAccess('DOTACION', 'can_view'), controller.getDeliveries);
// Corregido: peopleId en lugar de :id para evitar colisión con getDeliveryById
router.get('/deliveries/person/:peopleId', checkPageAccess('DOTACION', 'can_view'), controller.getPersonDeliveries);
router.get('/deliveries/:id', checkPageAccess('DOTACION', 'can_view'), controller.getDeliveryById);
router.post('/deliveries/generate', checkPageAccess('DOTACION', 'can_edit'), controller.generateDeliveries);
router.put('/deliveries/:id/sizes', checkPageAccess('DOTACION', 'can_edit'), controller.updateDeliverySizes);
router.put('/deliveries/:id/process', checkPageAccess('DOTACION', 'can_edit'), controller.processDelivery);

// ─────────────────────────────────────────────────────────────────────────
// FIRMA DIGITAL Y LOGÍSTICA
// ─────────────────────────────────────────────────────────────────────────
router.post('/deliveries/:id/send-email', checkPageAccess('DOTACION', 'can_edit'), controller.sendSignatureEmail);
router.put('/deliveries/:id/shipping', checkPageAccess('DOTACION', 'can_edit'), controller.updateShippingInfo);

// ─────────────────────────────────────────────────────────────────────────
// PROVEEDORES
// ─────────────────────────────────────────────────────────────────────────
router.get('/providers/orders', checkPageAccess('DOTACION', 'can_view'), controller.getProviderOrders);
router.post('/providers/orders', checkPageAccess('DOTACION', 'can_edit'), controller.createProviderOrder);
router.post('/providers/orders/bulk-excel', checkPageAccess('DOTACION', 'can_edit'), controller.sendBulkProviderExcel);
router.put('/providers/orders/:id/receive', checkPageAccess('DOTACION', 'can_edit'), controller.receiveProviderOrder);

// ─────────────────────────────────────────────────────────────────────────
// ENCUESTAS Y SATISFACCIÓN
// ─────────────────────────────────────────────────────────────────────────
router.get('/surveys', checkPageAccess('DOTACION', 'can_view'), controller.getAllSurveys);
router.get('/surveys/stats', checkPageAccess('DOTACION', 'can_view'), controller.getSurveyStats);

// ─────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────
router.get('/dashboard', checkPageAccess('DOTACION', 'can_view'), controller.getDashboardStats);

// ─────────────────────────────────────────────────────────────────────────
// TRASLADOS Y REASIGNACIONES
// ─────────────────────────────────────────────────────────────────────────
router.post('/traslados', checkPageAccess('DOTACION', 'can_edit'), controller.registerTraslado);
router.get('/traslados', checkPageAccess('DOTACION', 'can_view'), controller.getTraslados);

module.exports = router;
