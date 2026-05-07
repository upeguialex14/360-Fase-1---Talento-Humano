import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';

const AdminBlockedUsers = () => {
    const { user } = useAuth();
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role_id === 1) {
            fetchBlocked();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchBlocked = async () => {
        try {
            const res = await adminService.getBlockedUsers();
            if (res.success) {
                setBlocked(res.data);
            }
        } catch (err) {
            console.error('Error cargando usuarios bloqueados:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (userId) => {
        const confirmed = window.confirm('¿Desbloquear este usuario?');
        if (!confirmed) return;

        try {
            const res = await adminService.unlockUser(userId);
            if (res.success) {
                alert(res.message || 'Usuario desbloqueado');
                fetchBlocked();
            } else {
                alert(res.message || 'No se pudo desbloquear el usuario');
            }
        } catch (err) {
            console.error('Error desbloqueando usuario:', err);
            alert('Error al comunicarse con el servidor');
        }
    };

    if (!user) {
        return null;
    }

    if (user.role_id !== 1) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="page page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px', height: '40px', border: '4px solid rgba(255,205,4,0.2)',
                        borderTopColor: '#FFCD04', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: '#FFCD04' }}>Cargando usuarios bloqueados...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="page page-container" style={{ padding: '2rem' }}>
            <style>{`
                .blocked-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid rgba(255, 205, 4, 0.3);
                }
                .blocked-header h1 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #FFCD04;
                    margin: 0 0 0.5rem 0;
                }
                .blocked-header p {
                    color: #9ca3af;
                    margin: 0;
                    font-size: 1rem;
                }
                .blocked-table-wrap {
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .blocked-tbl {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                .blocked-tbl th {
                    background: rgba(255, 205, 4, 0.1);
                    color: #FFCD04;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    white-space: nowrap;
                    border-bottom: 2px solid rgba(255, 205, 4, 0.3);
                }
                .blocked-tbl td {
                    padding: 0.85rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    color: #e2e8f0;
                }
                .blocked-tbl tr:hover td {
                    background: rgba(255, 205, 4, 0.04);
                }
                .btn-unlock {
                    background: rgba(16, 185, 129, 0.2);
                    color: #6ee7b7;
                    border: 1px solid rgba(16, 185, 129, 0.4);
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-unlock:hover {
                    background: rgba(16, 185, 129, 0.3);
                }
                .badge-err {
                    display: inline-block;
                    padding: 0.2rem 0.5rem;
                    border-radius: 9999px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    background: rgba(239, 68, 68, 0.2);
                    color: #fca5a5;
                }
            `}</style>

            <div className="blocked-header">
                <h1>🔒 Usuarios Bloqueados</h1>
                <p>Cuentas deshabilitadas por exceder el número máximo de intentos fallidos u otras razones</p>
            </div>

            {blocked.length === 0 ? (
                 <div style={{
                    padding: '3rem', textAlign: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ fontSize: '1.1rem', color: '#6ee7b7' }}>✨ No hay usuarios bloqueados actualmente.</p>
                </div>
            ) : (
                <div className="blocked-table-wrap">
                    <table className="blocked-tbl">
                        <thead>
                            <tr>
                                <th>Documento</th>
                                <th>Nombre Completo</th>
                                <th style={{ textAlign: 'center' }}>Intentos Fallidos</th>
                                <th>Último acceso</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blocked.map((u) => (
                                <tr key={u.user_id}>
                                    <td><strong>{u.login}</strong></td>
                                    <td>{u.full_name}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge-err">{u.failed_attempts || 0}</span>
                                    </td>
                                    <td>{u.last_login ? new Date(u.last_login).toLocaleString() : 'N/A'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-unlock" onClick={() => handleUnlock(u.user_id)}>
                                            🔓 Desbloquear
                                        </button>
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

export default AdminBlockedUsers;