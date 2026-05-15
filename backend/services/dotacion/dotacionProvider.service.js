/**
 * Servicio de Gestión de Proveedores para Dotación
 */
const DotacionProviderOrder = require('../../models/dotacion/dotacionProviderOrder.model');
const DotacionInventoryService = require('./dotacionInventory.service');
const pool = require('../../config/db');

const DotacionProviderService = {

    /**
     * Crea un nuevo pedido al proveedor
     */
    async createOrder(orderData) {
        return await DotacionProviderOrder.create(orderData);
    },

    /**
     * Envia un archivo excel por email (simulado) y guarda el historial en DB
     */
    async sendBulkProviderExcel(data) {
        const { nombre, email, notas, jsonDatos } = data;
        
        // 1. Asegurar que la tabla histórico principal exista
        await pool.execute(`
        CREATE TABLE IF NOT EXISTS DOTACION_SOLICITUD_PROVEEDOR_HISTORICO (
            id INT AUTO_INCREMENT PRIMARY KEY,
            proveedor_nombre VARCHAR(255),
            proveedor_email VARCHAR(255),
            fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
            excel_json_data LONGTEXT
        );`);

        // 1.5. Asegurar que la tabla de detalle (para los 30 registros individuales) exista
        await pool.execute(`
        CREATE TABLE IF NOT EXISTS DOTACION_SOLICITUD_PROVEEDOR_DETALLE (
            id INT AUTO_INCREMENT PRIMARY KEY,
            historico_id INT,
            cedula VARCHAR(50),
            nombres_apellidos VARCHAR(255),
            empresa VARCHAR(255),
            estado_compania VARCHAR(100),
            genero VARCHAR(50),
            ciudad VARCHAR(100),
            unidad_negocio VARCHAR(255),
            oficina VARCHAR(255),
            talla_camisa VARCHAR(20),
            talla_pantalon VARCHAR(20),
            datos_completos LONGTEXT,
            FOREIGN KEY (historico_id) REFERENCES DOTACION_SOLICITUD_PROVEEDOR_HISTORICO(id) ON DELETE CASCADE
        );`);

        // 2. Guardar en histórico principal
        const [insertResult] = await pool.execute(`
            INSERT INTO DOTACION_SOLICITUD_PROVEEDOR_HISTORICO 
            (proveedor_nombre, proveedor_email, excel_json_data) 
            VALUES (?, ?, ?)
        `, [nombre, email, JSON.stringify(jsonDatos)]);
        
        const historicoId = insertResult.insertId;

        // 2.5 Guardar cada registro individual en la tabla de detalles
        for (const fila of jsonDatos) {
            await pool.execute(`
                INSERT INTO DOTACION_SOLICITUD_PROVEEDOR_DETALLE 
                (historico_id, cedula, nombres_apellidos, empresa, estado_compania, genero, ciudad, unidad_negocio, oficina, talla_camisa, talla_pantalon, datos_completos)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                historicoId,
                fila['CÉDULA'] || fila['CEDULA'] || '',
                fila['NOMBRES Y APELLIDOS'] || fila['APELLIDOS Y NOMBRES'] || '',
                fila['EMPRESA'] || '',
                fila['ESTADO EN LA COMPAÑÍA'] || fila['ESTADO EN LA COMPANIA'] || '',
                fila['GÉNERO'] || fila['GENERO'] || '',
                fila['CIUDAD'] || '',
                fila['UNIDAD DE NEGOCIO'] || '',
                fila['OFICINA'] || '',
                fila['TALLA CAMISA'] || '',
                fila['TALLA PANTALÓN'] || fila['TALLA PANTALON'] || '',
                JSON.stringify(fila) // Guardamos toda la fila también para evitar pérdida de datos
            ]);
        }

        // 3. Enviar correo real con archivo adjunto
        const emailService = require('./dotacionEmail.service');
        try {
            const emailResult = await emailService.sendProviderExcel(email, nombre, notas, jsonDatos);
            if (!emailResult.success) {
                console.warn('[DOTACION] Aviso: No se pudo enviar el correo real (Políticas de seguridad o SMTP AUTH deshabilitado).');
            } else {
                console.log(`[DOTACION] Excel ENVIADO a ${email} (${nombre}) con ${jsonDatos.length} registros`);
            }
        } catch (emailError) {
            console.error('[DOTACION] Error al enviar el correo (Microsoft/Office365 lo bloqueó):', emailError.message);
            return { 
                success: true, 
                message: 'Excel almacenado en historial y desglosado en BD correctamente. (Nota: El correo no salió por políticas de seguridad de Office 365. Verifica SMTP AUTH).' 
            };
        }

        return { success: true, message: 'Excel almacenado en historial y enviado exitosamente al proveedor.' };
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
