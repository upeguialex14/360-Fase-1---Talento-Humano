import { useState, useEffect } from 'react';
import api from '../services/api';

const Usuarios = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setError(null);
                const res = await api.get('/users');
                if (res.success) {
                    setUsers(res.data);
                } else {
                    setError(res.message || 'No se pudieron cargar los usuarios.');
                }
            } catch (err) {
                console.error('Error cargando usuarios:', err);
                setError('Error de conexión al cargar los usuarios. Verifica tus permisos o intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.document_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.role_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px', height: '40px', border: '4px solid rgba(255,205,4,0.2)',
                        borderTopColor: '#FFCD04', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: '#FFCD04' }}>Cargando usuarios...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page page-container" style={{ padding: '2rem' }}>
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '2rem auto'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ color: '#f87171', marginBottom: '0.5rem' }}>Error al cargar la página</h2>
                    <p style={{ color: '#fca5a5', fontSize: '0.95rem' }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1.5rem', padding: '0.7rem 2rem',
                            background: '#FFCD04', color: '#1C2A4A', border: 'none',
                            borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page page-container" style={{ padding: '2rem' }}>
            <style>{`
                .usuarios-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid rgba(255, 205, 4, 0.3);
                }
                .usuarios-header h1 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #FFCD04;
                    margin: 0 0 0.5rem 0;
                }
                .usuarios-header p {
                    color: #9ca3af;
                    margin: 0;
                    font-size: 1rem;
                }
                .usuarios-search-box {
                    margin-bottom: 1.5rem;
                    position: relative;
                }
                .usuarios-search-input {
                    width: 100%;
                    max-width: 500px;
                    padding: 0.85rem 1.2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    color: #e2e8f0;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }
                .usuarios-search-input:focus {
                    outline: none;
                    border-color: #FFCD04;
                    box-shadow: 0 0 0 3px rgba(255, 205, 4, 0.15);
                }
                .usuarios-search-input::placeholder {
                    color: #6b7280;
                }
                .usuarios-table-wrap {
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .usuarios-tbl {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                .usuarios-tbl th {
                    background: rgba(255, 205, 4, 0.1);
                    color: #FFCD04;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    white-space: nowrap;
                    border-bottom: 2px solid rgba(255, 205, 4, 0.3);
                }
                .usuarios-tbl td {
                    padding: 0.85rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    color: #e2e8f0;
                }
                .usuarios-tbl tr:hover td {
                    background: rgba(255, 205, 4, 0.04);
                }
                .badge-u {
                    display: inline-block;
                    padding: 0.3rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .badge-u.role { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
                .badge-u.active { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
                .badge-u.inactive { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
                .email-link {
                    color: #FFCD04;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .email-link:hover { opacity: 0.8; }
            `}</style>

            <div className="usuarios-header">
                <h1>👥 Gestión de Usuarios</h1>
                <p>Visualiza y administra todos los usuarios del sistema</p>
            </div>

            <div className="usuarios-search-box">
                <input
                    type="text"
                    className="usuarios-search-input"
                    placeholder="🔍 Buscar por documento, nombre, email o rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <small style={{ color: '#6b7280', marginTop: '0.5rem', display: 'block', fontSize: '0.85rem' }}>
                    {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                </small>
            </div>

            {filteredUsers.length === 0 ? (
                <div style={{
                    padding: '3rem', textAlign: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>No hay usuarios que coincidan con tu búsqueda</p>
                </div>
            ) : (
                <div className="usuarios-table-wrap">
                    <table className="usuarios-tbl">
                        <thead>
                            <tr>
                                <th>Documento</th>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th style={{ textAlign: 'center' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.user_id}>
                                    <td><strong>{u.document_number}</strong></td>
                                    <td>{u.full_name || `${u.name || ''} ${u.last_name || ''}`.trim()}</td>
                                    <td><a className="email-link" href={`mailto:${u.email}`}>{u.email}</a></td>
                                    <td><span className="badge-u role">{u.role_name || u.role_code || 'Sin rol'}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`badge-u ${u.is_active ? 'active' : 'inactive'}`}>
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

