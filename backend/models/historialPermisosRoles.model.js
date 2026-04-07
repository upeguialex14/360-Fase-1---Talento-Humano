/**
 * Historial de Permisos de Roles Model
 * Encapsulates audit trail for role permission changes
 */
const pool = require('../config/db');
const crypto = require('crypto');

const HistorialPermisosRoles = {
    async logAction(rolId, rolName, page, accion, realizadoPor, nombreAdmin) {
        try {
            await pool.execute(
                `INSERT INTO historial_permisos_roles (id, rol_id, nombre_rol, page, accion, realizado_por, nombre_admin, fecha_accion)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                [crypto.randomUUID(), rolId, rolName, page, accion, realizadoPor, nombreAdmin]
            );
            return { success: true };
        } catch (err) {
            console.error('[HistorialPermisosRoles] Error logging action:', err);
            throw err;
        }
    },

    async getHistoryByRole(rolId, limit = 50) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM historial_permisos_roles 
                 WHERE rol_id = ?
                 ORDER BY fecha_accion DESC
                 LIMIT ?`,
                [rolId, limit]
            );
            return rows;
        } catch (err) {
            console.error('[HistorialPermisosRoles] Error getting history by role:', err);
            return [];
        }
    },

    async getAll(limit = 100) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM historial_permisos_roles 
                 ORDER BY fecha_accion DESC
                 LIMIT ?`,
                [limit]
            );
            return rows;
        } catch (err) {
            console.error('[HistorialPermisosRoles] Error getting all history:', err);
            return [];
        }
    }
};

module.exports = HistorialPermisosRoles;
