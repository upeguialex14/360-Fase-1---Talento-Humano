import { useState, useEffect } from 'react';
import api from '../services/api';

const Permissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPermission, setNewPermission] = useState({
        permission_code: '', permission_name: '', module_name: '', description: ''
    });

    const fetchPermissions = async () => {
        try {
            const res = await api.get('/role-mgmt/permissions');
            if (res.success) setPermissions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/role-mgmt/permissions', newPermission);
            if (res.success) {
                alert('Permiso creado');
                setNewPermission({ permission_code: '', permission_name: '', module_name: '', description: '' });
                fetchPermissions();
            }
        } catch (err) {
            alert('Error al crear permiso');
        }
    };

    if (loading) return <div>Cargando permisos...</div>;

    return (
        <div className="page page-container">
            <h2>Gestión de Permisos</h2>

            <form onSubmit={handleCreate} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
                <h3>Crear Nuevo Permiso</h3>
                <input
                    placeholder="Código (Numérico)"
                    type="number"
                    value={newPermission.permission_code}
                    onChange={e => setNewPermission({ ...newPermission, permission_code: e.target.value })}
                    required
                />
                <input
                    placeholder="Nombre (ej: VIEW_PLANTA)"
                    value={newPermission.permission_name}
                    onChange={e => setNewPermission({ ...newPermission, permission_name: e.target.value })}
                    required
                />
                <input
                    placeholder="Módulo"
                    value={newPermission.module_name}
                    onChange={e => setNewPermission({ ...newPermission, module_name: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Descripción"
                    value={newPermission.description}
                    onChange={e => setNewPermission({ ...newPermission, description: e.target.value })}
                />
                <button type="submit">Crear Permiso</button>
            </form>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Módulo</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions.map(p => (
                        <tr key={p.permission_id}>
                            <td>{p.permission_code}</td>
                            <td>{p.permission_name}</td>
                            <td>{p.module_name}</td>
                            <td>{p.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Permissions;
