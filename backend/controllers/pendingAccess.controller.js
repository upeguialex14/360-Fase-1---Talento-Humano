const PendingAccess = require('../models/pendingAccess.model');
const User = require('../models/user.model');

const getPendingAccesses = async (req, res) => {
    try {
        const pending = await PendingAccess.getAllPending();
        res.json({ success: true, data: pending });
    } catch (error) {
        console.error('[PendingAccessController] Error getting pending accesses:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes pendientes' });
    }
};

const approveAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.body;
        const reviewed_by = req.user.user_id;

        if (!role_id) {
            return res.status(400).json({ success: false, message: 'El rol es obligatorio para aprobar el acceso.' });
        }

        const pendingRequest = await PendingAccess.findById(id);
        if (!pendingRequest || pendingRequest.status !== 'pending') {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada o ya procesada.' });
        }

        // Crear usuario en base de datos
        const names = pendingRequest.name ? pendingRequest.name.split(' ') : ['Usuario'];
        const name = names[0] || 'Usuario';
        const last_name = names.length > 1 ? names.slice(1).join(' ') : '';
        const email = pendingRequest.email;
        // El documento debe caber en el varchar, usamos el prefijo del email truncado a 20 chars
        const document_number = email.split('@')[0].substring(0, 20);

        // Crear usuario con estado 1 (activo)
        await User.create({
            document_number,
            password_hash: '', // No necesita contraseña ya que entra con Google
            email,
            name,
            last_name,
            role_id
        });

        // Actualizar solicitud
        await PendingAccess.updateStatus(id, 'approved', role_id, reviewed_by);

        res.json({ success: true, message: 'Acceso aprobado y usuario creado exitosamente.' });
    } catch (error) {
        console.error('[PendingAccessController] Error approving access:', error);
        res.status(500).json({ success: false, message: 'Error al aprobar el acceso' });
    }
};

const rejectAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const reviewed_by = req.user.user_id;

        const pendingRequest = await PendingAccess.findById(id);
        if (!pendingRequest || pendingRequest.status !== 'pending') {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada o ya procesada.' });
        }

        // Actualizar solicitud
        await PendingAccess.updateStatus(id, 'rejected', null, reviewed_by);

        res.json({ success: true, message: 'Acceso rechazado exitosamente.' });
    } catch (error) {
        console.error('[PendingAccessController] Error rejecting access:', error);
        res.status(500).json({ success: false, message: 'Error al rechazar el acceso' });
    }
};

module.exports = { getPendingAccesses, approveAccess, rejectAccess };
