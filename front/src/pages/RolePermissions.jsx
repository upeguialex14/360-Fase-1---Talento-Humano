import { useState, useEffect } from 'react';
import api from '../services/api';

const RolePermissions = () => {
    const [assignments, setAssignments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAssignment, setNewAssignment] = useState({ role_code: '', permission_code: '' });

    const fetchData = async () => {
        try {
            const [resRoles, resPerms, resAssign] = await Promise.all([
                api.get('/role-mgmt/roles'),
                api.get('/role-mgmt/permissions'),
                api.get('/role-mgmt/role-permissions')
            ]);
            if (resRoles.success) setRoles(resRoles.data);
            if (resPerms.success) setPermissions(resPerms.data);
            if (resAssign.success) setAssignments(resAssign.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/role-mgmt/role-permissions', newAssignment);
            if (res.success) {
                alert('Permiso asignado');
                fetchData();
            }
        } catch (err) {
            alert('Error al asignar');
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm('¿Revocar este permiso?')) return;
        try {
            const res = await api.delete(`/role-mgmt/role-permissions/${id}`);
            if (res.success) fetchData();
        } catch (err) {
            alert('Error al revocar');
        }
    };

    if (loading) return <div>Cargando asignaciones...</div>;

    return (
        <div className="page page-container">
            <h2>Asignación de Permisos a Roles</h2>

            <form onSubmit={handleAssign} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
                <h3>Nueva Asignación</h3>
                <select
                    value={newAssignment.role_code}
                    onChange={e => setNewAssignment({ ...newAssignment, role_code: e.target.value })}
                    required
                >
                    <option value="">Selecciona un Rol</option>
                    {roles.map(r => <option key={r.role_id} value={r.role_code}>{r.role_name}</option>)}
                </select>
                <select
                    value={newAssignment.permission_code}
                    onChange={e => setNewAssignment({ ...newAssignment, permission_code: e.target.value })}
                    required
                >
                    <option value="">Selecciona un Permiso</option>
                    {permissions.map(p => <option key={p.permission_id} value={p.Permissions_code}>{p.permission_name}</option>)}
                </select>
                <button type="submit">Asignar</button>
            </form>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Rol</th>
                        <th>Permiso</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map(a => (
                        <tr key={a.role_permission_id}>
                            <td>{a.role_name} ({a.role_code})</td>
                            <td>{a.permission_name}</td>
                            <td>
                                <button onClick={() => handleRevoke(a.role_permission_id)} style={{ color: 'red' }}>Revocar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RolePermissions;
