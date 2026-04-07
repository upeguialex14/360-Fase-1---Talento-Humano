import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';

const AdminBlockedUsers = () => {
    const { user } = useAuth();
    const [blocked, setBlocked] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role_code === 'ADMIN') {
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
        // todavía cargando contexto
        return null;
    }

    if (user.role_code !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return <div className="page page-container">Cargando usuarios bloqueados...</div>;
    }

    return (
        <div className="page page-container">
            <h2>Usuarios Bloqueados</h2>

            {blocked.length === 0 ? (
                <p>No hay usuarios bloqueados.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Login</th>
                            <th>Nombre</th>
                            <th>Intentos</th>
                            <th>Último acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blocked.map((u) => (
                            <tr key={u.user_id}>
                                <td>{u.login}</td>
                                <td>{u.full_name}</td>
                                <td>{u.failed_attempts}</td>
                                <td>{u.last_login ? new Date(u.last_login).toLocaleString() : ''}</td>
                                <td>
                                    <button onClick={() => handleUnlock(u.user_id)}>
                                        Desbloquear
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminBlockedUsers;