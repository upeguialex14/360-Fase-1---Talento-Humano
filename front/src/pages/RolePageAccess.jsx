import React, { useState, useEffect } from 'react';
import api from '../services/api';
import rolePageService from '../services/rolePageService';
import './RolePageAccess.css';

const RolePageAccess = () => {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Cargar roles al iniciar
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get('/role-mgmt/roles');
                if (res.success) setRoles(res.data);
            } catch (err) {
                console.error('Error al cargar roles:', err);
            }
        };
        fetchRoles();
    }, []);

    // Cargar páginas cuando cambia el rol seleccionado
    useEffect(() => {
        if (!selectedRole) {
            setPages([]);
            return;
        }

        const fetchRolePages = async () => {
            setLoading(true);
            try {
                const res = await rolePageService.getRolePages(selectedRole);
                if (res.success) {
                    setPages(res.data);
                } else {
                    setMessage({ type: 'error', text: res.message });
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Error al cargar los accesos del rol.' });
            } finally {
                setLoading(false);
            }
        };

        fetchRolePages();
    }, [selectedRole]);

    const handleCheckboxChange = (pageCode, field) => {
        setPages(prevPages => prevPages.map(page => {
            if (page.page_code === pageCode) {
                const newValue = page[field] === 1 ? 0 : 1;

                // Regla lógica: Si no puede ver, tampoco puede editar
                if (field === 'can_view' && newValue === 0) {
                    return { ...page, can_view: 0, can_edit: 0 };
                }
                // Si puede editar, automáticamente debe poder ver
                if (field === 'can_edit' && newValue === 1) {
                    return { ...page, can_view: 1, can_edit: 1 };
                }

                return { ...page, [field]: newValue };
            }
            return page;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await rolePageService.updateRolePages(selectedRole, pages);
            if (res.success) {
                setMessage({ type: 'success', text: 'Permisos actualizados correctamente.' });
                // Limpiar mensaje después de 3 segundos
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container role-access-container">
            <header className="page-header">
                <h2>Gestión de Accesos por Página</h2>
                <p>Configura qué páginas puede visualizar y editar cada rol del sistema.</p>
            </header>

            <div className="role-selector-card">
                <label htmlFor="role-select">Seleccione un Rol:</label>
                <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="role-select"
                >
                    <option value="">-- Seleccionar --</option>
                    {roles.map(role => (
                        <option key={role.role_code} value={role.role_code}>
                            {role.role_name} ({role.role_code})
                        </option>
                    ))}
                </select>
            </div>

            {message.text && (
                <div className={`alert-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="loading-state">Cargando accesos...</div>
            ) : selectedRole ? (
                <div className="pages-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código Página</th>
                                <th>Nombre Página</th>
                                <th>Ruta</th>
                                <th className="text-center">Visualizar</th>
                                <th className="text-center">Editar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map(page => (
                                <tr key={page.page_code}>
                                    <td><code>{page.page_code}</code></td>
                                    <td>{page.page_name}</td>
                                    <td>{page.route}</td>
                                    <td className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={page.can_view === 1}
                                            onChange={() => handleCheckboxChange(page.page_code, 'can_view')}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={page.can_edit === 1}
                                            onChange={() => handleCheckboxChange(page.page_code, 'can_edit')}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="actions-footer">
                        <button
                            className="btn-save"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    Seleccione un rol para comenzar a configurar sus accesos.
                </div>
            )}
        </div>
    );
};

export default RolePageAccess;
