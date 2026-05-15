import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UsuarioSahg = () => {
    const [sahgUsers, setSahgUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSahgUsers = async () => {
            setLoading(true);
            try {
                const response = await api.get('/planta-operacion');
                if (response && response.success) {
                    // Filtramos solo los que tienen usuario_ad (son los de SAHG/AD)
                    const users = response.data.filter(u => u.usuario_ad);
                    setSahgUsers(users);
                }
            } catch (error) {
                console.error('Error fetching Sahg users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSahgUsers();
    }, []);

    const filteredUsers = sahgUsers.filter(user => 
        (user.usuario_ad && user.usuario_ad.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.nombre && user.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.cedula && user.cedula.toString().includes(searchTerm))
    );

    return (
        <div className="page-container" style={{ padding: '2rem' }}>
            <style>{`
                .sahg-panel {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .sahg-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .sahg-header h1 {
                    color: #FFCD04;
                    font-size: 1.8rem;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .search-container {
                    position: relative;
                    min-width: 300px;
                }
                .search-input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0.7rem 1rem 0.7rem 2.5rem;
                    color: #fff;
                    font-size: 0.95rem;
                }
                .search-icon {
                    position: absolute;
                    left: 0.8rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                .sahg-table-container {
                    overflow-x: auto;
                }
                .sahg-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .sahg-table th {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .sahg-table td {
                    padding: 1.2rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                    font-size: 0.95rem;
                }
                .sahg-table tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status-badge.activo {
                    background: rgba(34, 197, 94, 0.1);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }
                .status-badge.inactivo {
                    background: rgba(239, 68, 68, 0.1);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 205, 4, 0.1);
                    color: #FFCD04;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.8rem;
                }
                .name-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
            `}</style>

            <div className="sahg-panel">
                <div className="sahg-header">
                    <h1>🛡️ Panel Usuarios SAHG</h1>
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Buscar por usuario o nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando usuarios...</div>
                ) : (
                    <div className="sahg-table-container">
                        <table className="sahg-table">
                            <thead>
                                <tr>
                                    <th>Usuario AD (Cédula)</th>
                                    <th>Nombre Completo</th>
                                    <th>Cargo</th>
                                    <th>Contraseña (Hash)</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id_planta}>
                                        <td>
                                            <span style={{ color: '#FFCD04', fontWeight: '600' }}>@{user.usuario_ad}</span>
                                        </td>
                                        <td>
                                            <div className="name-cell">
                                                <div className="user-avatar">{user.nombre ? user.nombre[0] : 'U'}</div>
                                                {user.nombre}
                                            </div>
                                        </td>
                                        <td>{user.cargo}</td>
                                        <td>
                                            <code style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                $2b$10$K9tZ8w... (Encrypted)
                                            </code>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${(user.status || 'ACTIVO').toLowerCase()}`}>
                                                {user.status || 'ACTIVO'}
                                            </span>
                                        </td>
                                        <td>
                                            <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>⋮</button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            No se encontraron usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsuarioSahg;
