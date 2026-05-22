import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AprobacionAccesos = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch pending requests
                const resPending = await api.get('/pending-access');
                if (resPending.success) {
                    setPendingRequests(resPending.data);
                }

                // Fetch roles
                const resRoles = await api.get('/roles');
                if (resRoles.success) {
                    setRoles(resRoles.data);
                }
            } catch (err) {
                console.error('Error loading pending accesses:', err);
                setError('No se pudieron cargar las solicitudes pendientes.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleApprove = async (id, roleId) => {
        if (!roleId) {
            alert('Debes seleccionar un rol para aprobar el acceso.');
            return;
        }

        if (window.confirm('¿Estás seguro de que deseas aprobar este acceso?')) {
            try {
                const res = await api.post(`/pending-access/${id}/approve`, { role_id: roleId });
                if (res.success) {
                    alert('Acceso aprobado y usuario creado exitosamente.');
                    setPendingRequests(pendingRequests.filter(req => req.id !== id));
                } else {
                    alert(res.message || 'Error al aprobar acceso');
                }
            } catch (err) {
                console.error(err);
                alert('Error al aprobar acceso');
            }
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas rechazar este acceso? El usuario no podrá ingresar.')) {
            try {
                const res = await api.post(`/pending-access/${id}/reject`);
                if (res.success) {
                    alert('Acceso rechazado.');
                    setPendingRequests(pendingRequests.filter(req => req.id !== id));
                } else {
                    alert(res.message || 'Error al rechazar acceso');
                }
            } catch (err) {
                console.error(err);
                alert('Error al rechazar acceso');
            }
        }
    };

    if (loading) return <div className="page page-container" style={{ padding: '2rem' }}>Cargando...</div>;
    if (error) return <div className="page page-container" style={{ padding: '2rem', color: 'red' }}>{error}</div>;

    return (
        <div className="page page-container" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '2px solid rgba(255, 205, 4, 0.3)', paddingBottom: '1.5rem' }}>
                <h1 style={{ color: '#FFCD04', margin: '0 0 0.5rem 0' }}>🔐 Aprobación de Nuevos Accesos</h1>
                <p style={{ color: '#9ca3af', margin: 0 }}>Gestiona los usuarios que intentaron iniciar sesión por primera vez con su correo corporativo.</p>
            </div>

            {pendingRequests.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No hay solicitudes de acceso pendientes.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th style={{ background: 'rgba(255,205,4,0.1)', color: '#FFCD04', padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,205,4,0.3)' }}>Usuario</th>
                                <th style={{ background: 'rgba(255,205,4,0.1)', color: '#FFCD04', padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,205,4,0.3)' }}>Email</th>
                                <th style={{ background: 'rgba(255,205,4,0.1)', color: '#FFCD04', padding: '1rem', textAlign: 'left', borderBottom: '2px solid rgba(255,205,4,0.3)' }}>Fecha de Solicitud</th>
                                <th style={{ background: 'rgba(255,205,4,0.1)', color: '#FFCD04', padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,205,4,0.3)' }}>Asignar Rol</th>
                                <th style={{ background: 'rgba(255,205,4,0.1)', color: '#FFCD04', padding: '1rem', textAlign: 'center', borderBottom: '2px solid rgba(255,205,4,0.3)' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRequests.map(req => {
                                // Default rol: Empleado o Analista si existe, de lo contrario dejar en blanco
                                return (
                                    <tr key={req.id}>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {req.picture_url ? (
                                                    <img src={req.picture_url} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {req.name ? req.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                <strong>{req.name || 'Sin nombre'}</strong>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0' }}>{req.email}</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0' }}>{new Date(req.created_at).toLocaleString()}</td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                            <select 
                                                id={`role-select-${req.id}`}
                                                style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                                            >
                                                <option value="">-- Seleccionar Rol --</option>
                                                {roles.map(r => (
                                                    <option key={r.role_id} value={r.role_id}>{r.name_role}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleApprove(req.id, document.getElementById(`role-select-${req.id}`).value)}
                                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem', fontWeight: 'bold' }}
                                            >
                                                ✓ Aprobar
                                            </button>
                                            <button 
                                                onClick={() => handleReject(req.id)}
                                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                ✗ Rechazar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AprobacionAccesos;
