const SolicitudVacante = require('../models/solicitudVacante.model');
const Requisicion = require('../models/requisicion.model');

class SolicitudVacanteController {
    // Obtener todas las solicitudes
    static async getAll(req, res) {
        try {
            const filters = {
                busqueda: req.query.busqueda,
                estado: req.query.estado
            };

            // Si no es admin/lider, solo ve las suyas
            if (req.user.role_id !== 1 && req.user.role_code !== 'ANALISTA_LIDER') {
                filters.solicitante_id = req.user.user_id;
            }

            const solicitudes = await SolicitudVacante.getAll(filters);
            res.json({ success: true, data: solicitudes });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // Obtener por ID
    static async getById(req, res) {
        try {
            const solicitud = await SolicitudVacante.getById(req.params.id);
            if (!solicitud) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            }

            const historial = await SolicitudVacante.getHistorial(req.params.id);
            res.json({ success: true, data: { ...solicitud, historial } });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // Crear solicitud
    static async create(req, res) {
        try {
            const data = {
                ...req.body,
                solicitante_id: req.user.user_id
            };

            const result = await SolicitudVacante.create(data);
            if (result) {
                res.status(201).json({ success: true, data: result, message: 'Solicitud creada con éxito' });
            } else {
                res.status(400).json({ success: false, message: 'No se pudo crear la solicitud' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // Actualizar solicitud
    static async update(req, res) {
        try {
            const success = await SolicitudVacante.update(req.params.id, req.body, req.user.user_id);
            if (success) {
                res.json({ success: true, message: 'Solicitud actualizada con éxito' });
            } else {
                res.status(400).json({ success: false, message: 'No se pudo actualizar la solicitud' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // Enviar solicitud (y crear requisición si se aprueba o se envía directamente)
    static async enviar(req, res) {
        try {
            const success = await SolicitudVacante.enviar(req.params.id, req.user.user_id);
            if (success) {
                // Si el usuario es Admin o Lider, podemos opcionalmente "promoverlo" a Requisición automáticamente
                // Pero por ahora solo cambiamos el estado como pidió el usuario.
                // "una vez acabada... debe de aparecer en el modulo/page 'Gestion de Requisiciones'"
                
                const solicitud = await SolicitudVacante.getById(req.params.id);
                
                // Crear la requisición automáticamente al enviar
                const reqData = {
                    solicitud_id: solicitud.id,
                    solicitante_id: solicitud.solicitante_id,
                    empresa: solicitud.empresa,
                    cliente: solicitud.cliente,
                    regional: solicitud.regional,
                    unidad_negocio: solicitud.unidad_negocio,
                    zona: solicitud.zona,
                    cargo: solicitud.cargo,
                    cantidad: solicitud.cantidad,
                    ciudad: solicitud.ciudad,
                    oficina: solicitud.oficina,
                    justificacion: solicitud.justificacion,
                    detalle: solicitud.detalle,
                    tipo_contrato: solicitud.tipo_contrato,
                    hoja_vida_path: solicitud.hoja_vida_path,
                    aprobacion_path: solicitud.aprobacion_path
                };

                const reqId = await Requisicion.create(reqData);

                res.json({ 
                    success: true, 
                    message: 'Solicitud enviada y requisición generada con éxito',
                    requisicion_id: reqId 
                });
            } else {
                res.status(400).json({ success: false, message: 'No se pudo enviar la solicitud' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = SolicitudVacanteController;
