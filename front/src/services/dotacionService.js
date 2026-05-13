import api from './api';

/**
 * Servicio para el Módulo de Dotación
 */
const dotacionService = {
    // ═══════════════════════════════════════════════════════════════════════════
    // ITEMS E INVENTARIO
    // ═══════════════════════════════════════════════════════════════════════════
    getItems: () => api.get('/dotacion/items'),
    getInventory: () => api.get('/dotacion/inventory'),
    getLowStock: () => api.get('/dotacion/inventory/low-stock'),
    getKardex: (params) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/dotacion/kardex?${query}`);
    },
    adjustInventory: (data) => api.post('/dotacion/inventory/adjust', data),

    // ═══════════════════════════════════════════════════════════════════════════
    // PLANES Y ELEGIBILIDAD
    // ═══════════════════════════════════════════════════════════════════════════
    getEligible: (year, period) => api.get(`/dotacion/eligible/${year}/${period}`),
    getPlans: () => api.get('/dotacion/plans'),
    getPlanById: (id) => api.get(`/dotacion/plans/${id}`),
    createPlan: (data) => api.post('/dotacion/plans', data),
    addPersonToPlan: (planId, peopleId) => api.post(`/dotacion/plans/${planId}/people`, { peopleId }),

    // ═══════════════════════════════════════════════════════════════════════════
    // ENTREGAS Y LOGÍSTICA
    // ═══════════════════════════════════════════════════════════════════════════
    getDeliveries: (params) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/dotacion/deliveries?${query}`);
    },
    generateDeliveries: (planId, periodNumber) => api.post('/dotacion/deliveries/generate', { planId, periodNumber }),
    processDelivery: (deliveryId) => api.put(`/dotacion/deliveries/${deliveryId}/process`),
    updateShipping: (deliveryId, data) => api.put(`/dotacion/deliveries/${deliveryId}/shipping`, data),
    sendSignatureEmail: (deliveryId, frontendUrl) => api.post(`/dotacion/deliveries/${deliveryId}/send-email`, { frontend_url: frontendUrl }),

    // ═══════════════════════════════════════════════════════════════════════════
    // RUTA PÚBLICA (FIRMA Y ENCUESTA)
    // ═══════════════════════════════════════════════════════════════════════════
    validateToken: (token) => api.get(`/dotacion/public/sign/${token}`),
    submitSignature: (token, signatureBase64) => api.post(`/dotacion/public/sign/${token}`, { signature_base64: signatureBase64 }),
    submitSurvey: (data) => api.post('/dotacion/public/survey', data),

    // ═══════════════════════════════════════════════════════════════════════════
    // DASHBOARD Y REPORTES
    // ═══════════════════════════════════════════════════════════════════════════
    getDashboardStats: (year, period) => api.get(`/dotacion/dashboard?year=${year}&period=${period}`),
    getAlertLogs: () => api.get('/dotacion/alerts/logs'),
    getSurveyStats: async (year) => {
        const response = await api.get(`/dotacion/surveys/stats?year=${year}`);
        return response;
    },
    uploadInventoryExcel: async (formData) => {
        // Usamos el endpoint genérico de ETL con el tipo DOTACION
        const response = await api.upload('/etl/upload/DOTACION', formData);
        return response;
    }
};

export default dotacionService;
