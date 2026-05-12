import { useState, useCallback } from 'react';
import dotacionService from '../services/dotacionService';

/**
 * Hook para gestionar la lógica del módulo de Dotación
 */
export const useDotacion = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const wrapRequest = useCallback(async (requestFn) => {
        setLoading(true);
        setError(null);
        try {
            const response = await requestFn();
            if (response && response.success === false) {
                setError(response.message);
                return response;
            }
            return response;
        } catch (err) {
            const msg = err.message || 'Error inesperado en el servidor';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── ACCIONES DE INVENTARIO ───
    const fetchInventory = () => wrapRequest(() => dotacionService.getInventory());
    const adjustStock = (data) => wrapRequest(() => dotacionService.adjustInventory(data));

    // ─── ACCIONES DE PLANES ───
    const fetchEligible = (year, period) => wrapRequest(() => dotacionService.getEligible(year, period));
    const createNewPlan = (data) => wrapRequest(() => dotacionService.createPlan(data));

    // ─── ACCIONES DE ENTREGAS ───
    const fetchDeliveries = (params) => wrapRequest(() => dotacionService.getDeliveries(params));
    const processDelivery = (id) => wrapRequest(() => dotacionService.processDelivery(id));
    const sendSignatureRequest = (id) => {
        const frontendUrl = window.location.origin;
        return wrapRequest(() => dotacionService.sendSignatureEmail(id, frontendUrl));
    };

    // ─── ACCIONES PÚBLICAS ───
    const validateToken = (token) => wrapRequest(() => dotacionService.validateToken(token));
    const signDelivery = (token, signature) => wrapRequest(() => dotacionService.submitSignature(token, signature));

    return {
        loading,
        error,
        fetchInventory,
        adjustStock,
        fetchEligible,
        createNewPlan,
        fetchDeliveries,
        processDelivery,
        sendSignatureRequest,
        validateToken,
        signDelivery
    };
};

export default useDotacion;
