import { useState, useEffect } from 'react';
import api from '../services/api';
import './Roles.css';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRole, setNewRole] = useState({ role_name: '', description: '' });
    const [selectedRoleUsers, setSelectedRoleUsers] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/role-mgmt/roles');
            if (res.success) setRoles(res.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/role-mgmt/roles', newRole);
            if (res.success) {
                setNewRole({ role_name: '', description: '' });
                fetchRoles();
            }
        } catch (err) {
            alert('Error al crear rol');
        }
    };

    const handleShowUsers = async (roleId, roleName) => {
        setModalLoading(true);
        setSelectedRoleUsers({ name: roleName, users: [] });
        try {
            const res = await api.get(`/role-mgmt/roles/${roleId}/users`);
            if (res.success) {
                setSelectedRoleUsers({ name: roleName, users: res.data });
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setModalLoading(false);
        }
    };

    if (loading) return <div className="roles-page">Cargando roles...</div>;

    return (
        <div className="roles-page">
            <div className="roles-header">
                <h2>Gestión de Roles</h2>
            </div>

            <div className="create-role-card">
                <h3>Crear Nuevo Rol</h3>
                <form onSubmit={handleCreate} className="role-form">
                    <div className="form-group">
                        <input
                            className="role-input"
                            placeholder="Nombre del Rol (ej: Supervisor)"
                            value={newRole.role_name}
                            onChange={e => setNewRole({ ...newRole, role_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            className="role-input role-textarea"
                            placeholder="Descripción de responsabilidades..."
                            value={newRole.description}
                            onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn-create">Crear Rol</button>
                </form>
            </div>

            <div className="roles-table-container">
                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th style={{ textAlign: 'center' }}>Portadores</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role.role_id}>
                                <td>
                                    <span className="role-code-badge">{role.role_code || '---'}</span>
                                </td>
                                <td style={{ fontWeight: '600' }}>{role.name_role}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {role.portadores > 0 ? (
                                        <span 
                                            className="portadores-link"
                                            onClick={() => handleShowUsers(role.role_id, role.name_role)}
                                        >
                                            {role.portadores} Usuarios
                                        </span>
                                    ) : (
                                        <span style={{ color: '#64748b' }}>0 Usuarios</span>
                                    )}
                                </td>
                                <td style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {role.description || 'Sin descripción'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Usuarios */}
            {selectedRoleUsers && (
                <div className="modal-overlay" onClick={() => setSelectedRoleUsers(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Usuarios con rol: {selectedRoleUsers.name}</h3>
                            <button className="close-modal" onClick={() => setSelectedRoleUsers(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {modalLoading ? (
                                <p>Cargando lista...</p>
                            ) : selectedRoleUsers.users.length > 0 ? (
                                <ul className="user-list">
                                    {selectedRoleUsers.users.map((user, idx) => (
                                        <li key={idx} className="user-item">
                                            <div className="user-avatar">
                                                {user.name.charAt(0)}{user.last_name.charAt(0)}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{user.name} {user.last_name}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay usuarios asignados a este rol.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
