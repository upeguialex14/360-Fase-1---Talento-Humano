import React, { useState, useEffect } from 'react';
import api from '../services/api';
import rolePageService from '../services/rolePageService';
import './RolePageAccess.css';

const RolePageAccess = () => {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null); // Ahora es el objeto del rol
    const [pages, setPages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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
                // Usamos el role_id numérico para la API
                const res = await rolePageService.getRolePages(selectedRole.role_id);
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

    const handleToggle = (pageCode, field) => {
        setPages(prevPages => prevPages.map(page => {
            if (page.page_code === pageCode) {
                const newValue = page[field] === 1 ? 0 : 1;

                // Lógica de dependencia
                if (field === 'can_view' && newValue === 0) {
                    return { ...page, can_view: 0, can_edit: 0 };
                }
                if (field === 'can_edit' && newValue === 1) {
                    return { ...page, can_view: 1, can_edit: 1 };
                }

                return { ...page, [field]: newValue };
            }
            return page;
        }));
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await rolePageService.updateRolePages(selectedRole.role_id, pages);
            if (res.success) {
                setMessage({ type: 'success', text: 'Permisos actualizados correctamente.' });
                setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
        } finally {
            setSaving(false);
        }
    };

    const filteredPages = pages.filter(p => 
        p.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.page_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="role-page-access-container">
            <header className="role-access-header">
                <h2>Gestión de Accesos por Rol</h2>
                <p>Define quién puede visualizar y quién puede editar cada módulo del sistema.</p>
            </header>

            <div className="role-access-main">
                {/* Sidebar Izquierda: Roles */}
                <aside className="roles-sidebar">
                    <h3>Roles del Sistema</h3>
                    <div className="role-list">
                        {roles.map(role => (
                            <button
                                key={role.role_id}
                                className={`role-item-btn ${selectedRole?.role_id === role.role_id ? 'active' : ''}`}
                                onClick={() => setSelectedRole(role)}
                            >
                                <span className="role-item-name">{role.name_role}</span>
                                <span className="role-item-code">{role.role_code}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Contenido Derecha: Páginas */}
                <main className="pages-content">
                    {selectedRole ? (
                        <>
                            <div className="pages-header-actions">
                                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                    <input 
                                        type="text" 
                                        className="role-input" 
                                        placeholder="Buscar módulo o página..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', marginBottom: 0 }}
                                    />
                                </div>
                                <button
                                    className="btn-save-fixed"
                                    onClick={handleSave}
                                    disabled={saving || pages.length === 0}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading-state">Cargando módulos...</div>
                            ) : (
                                <div className="pages-grid">
                                    {filteredPages.map(page => (
                                        <div key={page.page_code} className="page-card">
                                            <div className="page-info">
                                                <h4>{page.page_name}</h4>
                                                <span className="page-code">{page.page_code}</span>
                                                <p>{page.description || 'Sin descripción disponible para este módulo.'}</p>
                                            </div>
                                            
                                            <div className="permission-toggles">
                                                <div 
                                                    className={`toggle-group ${page.can_view === 1 ? 'active' : ''}`}
                                                    onClick={() => handleToggle(page.page_code, 'can_view')}
                                                >
                                                    <div className="custom-switch"></div>
                                                    <span className="toggle-label">Ver</span>
                                                </div>

                                                <div 
                                                    className={`toggle-group ${page.can_edit === 1 ? 'active' : ''}`}
                                                    onClick={() => handleToggle(page.page_code, 'can_edit')}
                                                >
                                                    <div className="custom-switch"></div>
                                                    <span className="toggle-label">Editar</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredPages.length === 0 && (
                                        <div className="access-empty-state" style={{ gridColumn: '1/-1' }}>
                                            No se encontraron módulos con ese nombre.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="access-empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <h3>Selecciona un rol para configurar sus accesos</h3>
                            <p>Elige un rol de la lista de la izquierda para ver qué módulos tiene permitidos.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Toasts de mensaje */}
            {message.text && (
                <div className={`alert-toast ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default RolePageAccess;
