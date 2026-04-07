import { useState, useEffect } from 'react';
import api from '../services/api';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRole, setNewRole] = useState({ role_code: '', role_name: '', description: '' });

    const fetchRoles = async () => {
        try {
            const res = await api.get('/role-mgmt/roles');
            if (res.success) setRoles(res.data);
        } catch (err) {
            console.error(err);
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
                alert('Rol creado');
                setNewRole({ role_code: '', role_name: '', description: '' });
                fetchRoles();
            }
        } catch (err) {
            alert('Error al crear rol');
        }
    };

    if (loading) return <div>Cargando roles...</div>;

    return (
        <div className="page page-container">
            <h2>Gestión de Roles</h2>

            <form onSubmit={handleCreate} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
                <h3>Crear Nuevo Rol</h3>
                <input
                    placeholder="Código (ej: ADMIN)"
                    value={newRole.role_code}
                    onChange={e => setNewRole({ ...newRole, role_code: e.target.value })}
                    required
                />
                <input
                    placeholder="Nombre"
                    value={newRole.role_name}
                    onChange={e => setNewRole({ ...newRole, role_name: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Descripción"
                    value={newRole.description}
                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                />
                <button type="submit">Crear Rol</button>
            </form>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map(role => (
                        <tr key={role.role_id}>
                            <td>{role.role_code}</td>
                            <td>{role.role_name}</td>
                            <td>{role.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Roles;
