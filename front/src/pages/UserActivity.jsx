import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { Navigate } from 'react-router-dom';

const UserActivity = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role_id === 1) {
            fetchActivity();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchActivity = async () => {
        try {
            const res = await adminService.getUserActivity();
            if (res.success) {
                setRecords(res.data);
            }
        } catch (err) {
            console.error('Error cargando actividad de usuarios:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;
    if (user.role_id !== 1) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return <div className="page page-container">Cargando actividad...</div>;
    }

    return (
        <div className="page page-container">
            <h2>Actividad de Usuarios</h2>
            {records.length === 0 ? (
                <p>No hay registros disponibles</p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Fecha Login</th>
                                <th>Fecha Logout</th>
                                <th>Duración (min)</th>
                                <th>IP</th>
                                <th>Navegador</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id}>
                                    <td>{r.usuario_login || r.nombre_usuario}</td>
                                    <td>{r.fecha_login ? new Date(r.fecha_login).toLocaleString() : ''}</td>
                                    <td>{r.fecha_logout ? new Date(r.fecha_logout).toLocaleString() : ''}</td>
                                    <td>{r.duracion_minutos || '-'}</td>
                                    <td>{r.ip_usuario}</td>
                                    <td>{r.navegador}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserActivity;