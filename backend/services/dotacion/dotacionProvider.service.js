/**
 * Servicio de Gestión de Proveedores para Dotación
 */
const DotacionProviderOrder = require('../../models/dotacion/dotacionProviderOrder.model');
const DotacionInventoryService = require('./dotacionInventory.service');

const DotacionProviderService = {

    /**
     * Crea un nuevo pedido al proveedor
     */
    async createOrder(orderData) {
        return await DotacionProviderOrder.create(orderData);
    },

    /**
     * Recibe un pedido: Actualiza estado e incrementa inventario
     */
    async receiveOrder(orderId, performedBy) {
        const order = await DotacionProviderOrder.getById(orderId);
        if (!order) throw new Error('Pedido no encontrado');
        if (order.status === 'RECIBIDO') throw new Error('Este pedido ya fue recibido');

        // 1. Marcar pedido como recibido
        await DotacionProviderOrder.updateStatus(orderId, 'RECIBIDO');

        // 2. Incrementar stock en inventario a través del Kardex
        await DotacionInventoryService.registerMovement({
            item_id: order.item_id,
            size: order.size,
            type: 'ENTRADA',
            quantity: order.quantity,
            performed_by: performedBy,
            note: `Recepción de pedido proveedor: ${order.provider_name} (ID: ${orderId})`
        });

        return { success: true, message: 'Pedido recibido e inventario actualizado' };
    },

    /**
     * Obtiene todos los pedidos
     */
    async getOrders(filters) {
        return await DotacionProviderOrder.getAll(filters);
    }
};

module.exports = DotacionProviderService;
