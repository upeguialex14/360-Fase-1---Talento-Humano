import { useState, useEffect } from 'react';
import api from '../services/api';

const Usuarios = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                if (res.success) setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="page page-container"><p>Cargando usuarios...</p></div>;

    return (
        <div className="page page-container usuarios-page">
            <div className="page-header">
                <h1>Gestión de Usuarios</h1>
                <p>Visualiza y administra todos los usuarios del sistema</p>
            </div>

            <div className="search-box" style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por login, nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                    {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                </small>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', background: 'var(--background-color)', borderRadius: 'var(--border-radius-lg)' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No hay usuarios que coincidan con tu búsqueda</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="data-table usuarios-table">
                        <thead>
                            <tr>
                                <th>Login</th>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th className="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.user_id} className="table-row-hover">
                                    <td><strong>{u.login}</strong></td>
                                    <td>{u.full_name}</td>
                                    <td><a href={`mailto:${u.email}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{u.email}</a></td>
                                    <td><span className="badge badge-role">{u.role_code}</span></td>
                                    <td className="text-center">
                                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                                            {u.is_active ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
