import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logoImg from '../IMG/LOGO_MULTIVAL-removebg-preview.png';

// Iconos SVG en línea para los módulos de Parametrización
const Icons = {
    settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    ),
    users: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    ),
    shield: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    ),
    key: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        </svg>
    ),
    link: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    ),
    userX: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="18" y1="8" x2="23" y2="13"></line>
            <line x1="23" y1="8" x2="18" y2="13"></line>
        </svg>
    ),
    briefcase: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
    ),
    clipboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
    ),
    fileText: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    ),
    calendar: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    ),
    chevronDown: (isOpen) => (
        <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ 
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
            }}
        >
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    ),
    home: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    )
};

// Rutas que pertenecen al menú de Parametrización
const PARAMETRIZACION_ROUTES = [
    '/home/roles',
    '/home/permissions',
    '/home/users',
    '/home/role-page-access',
    '/home/admin/blocked-users'
];

// Rutas que pertenecen al menú de Formularios
const FORMULARIOS_ROUTES = [
    '/home/documentacion',
    '/home/vacaciones'
];

// Rutas que pertenecen al menú de Bases
const BASES_ROUTES = [
    '/home/base-inactiva',
    '/home/base-unificada'
];

/**
 * Sidebar vertical izquierdo con logo y navegación basada en páginas del usuario
 * Incluye menú desplegable "Parametrización" para módulos de administración
 */
const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isParametrizacionOpen, setIsParametrizacionOpen] = useState(false);
    const [isFormulariosOpen, setIsFormulariosOpen] = useState(false);
    const [isBasesOpen, setIsBasesOpen] = useState(false);

    // Verificar si alguna ruta activa pertenece a Parametrización
    useEffect(() => {
        const isParametrizacionRoute = PARAMETRIZACION_ROUTES.some(route => 
            location.pathname === route || location.pathname.startsWith(route + '/')
        );
        setIsParametrizacionOpen(isParametrizacionRoute);
    }, [location.pathname]);

    // Verificar si alguna ruta activa pertenece a Formularios
    useEffect(() => {
        const isFormulariosRoute = FORMULARIOS_ROUTES.some(route => 
            location.pathname === route || location.pathname.startsWith(route + '/')
        );
        setIsFormulariosOpen(isFormulariosRoute);
    }, [location.pathname]);

    // Verificar si alguna ruta activa pertenece a Bases
    useEffect(() => {
        const isBasesRoute = BASES_ROUTES.some(route => 
            location.pathname === route || location.pathname.startsWith(route + '/')
        );
        setIsBasesOpen(isBasesRoute);
    }, [location.pathname]);

    // prepare unique page list so duplicates from the backend don't show twice
    // Excluir las páginas que ya están en el menú de Parametrización
    const uniquePages = [];
    if (user && user.pages) {
        const seenCodes = new Set();
        const seenNames = new Set();
        user.pages.forEach(page => {
            const pageRoute = page.route || page.path;
            // Filtrar páginas que pertenecen a Parametrización (se mostrarán en el dropdown)
            const isParametrizacionPage = PARAMETRIZACION_ROUTES.some(route => 
                pageRoute === route || pageRoute === route.replace(/^\//, '')
            );
            if (isParametrizacionPage) {
                return; // Omitir páginas que ya están en Parametrización
            }
            if (seenCodes.has(page.page_code) || seenNames.has(page.page_name)) {
                return;
            }
            seenCodes.add(page.page_code);
            seenNames.add(page.page_name);
            uniquePages.push(page);
        });
    }

    // datos de última sesión
    const [lastSession, setLastSession] = useState('');

    useEffect(() => {
        const fetchLast = async () => {
            if (user) {
                try {
                    const res = await api.get('/auth/last-session');
                    if (res.success) {
                        if (res.last_login) {
                            const dt = new Date(res.last_login);
                            const formatted = dt.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                            setLastSession(formatted);
                        } else {
                            setLastSession(''); // indica primera sesión
                        }
                    }
                } catch (err) {
                    console.error('Error obteniendo última sesión:', err);
                }
            }
        };
        fetchLast();
    }, [user]);

    // Determinar si el menú de Parametrización está activo
    const isParametrizacionActive = PARAMETRIZACION_ROUTES.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    // Determinar si el menú de Formularios está activo
    const isFormulariosActive = FORMULARIOS_ROUTES.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    // Determinar si el menú de Bases está activo
    const isBasesActive = BASES_ROUTES.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    return (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <img src={logoImg} alt="logo" className="sidebar-logo" />
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/home" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="sidebar-icon">{Icons.home}</span>
                            Inicio
                        </NavLink>
                    </li>

                    {uniquePages.map(page => {
                        const rawRoute = page.route || page.path || '';
                        // Normalizar ruta: si el backend la devuelve sin /home/, agregarla
                        const pageRoute = rawRoute.startsWith('/home')
                            ? rawRoute
                            : `/home${rawRoute.startsWith('/') ? rawRoute : '/' + rawRoute}`;
                        const pageName = page.page_name || page.name;

                        return (
                            <li key={page.page_code}>
                                <NavLink to={pageRoute} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                                    {pageName}
                                </NavLink>
                            </li>
                        );
                    })}

                    {/* Solicitud de Vacantes - Solo para administradores */}
                    {user && user.role_id === 1 && (
                        <li>
                            <NavLink to="/home/solicitud-vacantes" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                                <span className="sidebar-icon">{Icons.briefcase}</span>
                                Solicitud de Vacantes
                            </NavLink>
                        </li>
                    )}

                    {/* Gestión de Requisiciones - Solo para administradores */}
                    {user && user.role_id === 1 && (
                        <li>
                            <NavLink to="/home/gestion-requisiciones" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                                <span className="sidebar-icon">{Icons.clipboard}</span>
                                Gestión de Requisiciones
                            </NavLink>
                        </li>
                    )}

                    {/* Menú Parametrización - Solo para administradores (role_id === 1) */}
                    {user && user.role_id === 1 && (
                        <li className="sidebar-dropdown">
                            <button 
                                className={`sidebar-dropdown-toggle ${isParametrizacionActive ? 'active' : ''}`}
                                onClick={() => setIsParametrizacionOpen(!isParametrizacionOpen)}
                            >
                                <span className="sidebar-icon">{Icons.settings}</span>
                                <span className="sidebar-link-text">Parametrización</span>
                                <span className="sidebar-chevron">{Icons.chevronDown(isParametrizacionOpen)}</span>
                            </button>
                            
                            <ul className={`sidebar-dropdown-menu ${isParametrizacionOpen ? 'open' : ''}`}>
                                <li>
                                    <NavLink 
                                        to="/home/roles" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.users}</span>
                                        Gestión de Roles
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/home/permissions" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.shield}</span>
                                        Gestión de Permisos
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/home/users" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.key}</span>
                                        Gestión de Usuarios
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/home/role-page-access" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.link}</span>
                                        Accesos por Rol
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/home/admin/blocked-users" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.userX}</span>
                                        Usuarios Bloqueados
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                    )}

                    {/* Menú Formularios - Solo para administradores */}
                    {user && user.role_id === 1 && (
                        <li className="sidebar-dropdown">
                            <button 
                                className={`sidebar-dropdown-toggle ${isFormulariosActive ? 'active' : ''}`}
                                onClick={() => setIsFormulariosOpen(!isFormulariosOpen)}
                            >
                                <span className="sidebar-icon">{Icons.fileText}</span>
                                <span className="sidebar-link-text">Formularios</span>
                                <span className="sidebar-chevron">{Icons.chevronDown(isFormulariosOpen)}</span>
                            </button>
                            
                            <ul className={`sidebar-dropdown-menu ${isFormulariosOpen ? 'open' : ''}`}>
                                <li>
                                    <NavLink 
                                        to="/home/documentacion" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.fileText}</span>
                                        Documentación
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/home/vacaciones" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.calendar}</span>
                                        Vacaciones
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                    )}

                    {/* Menú Bases - Solo para administradores */}
                    {user && user.role_id === 1 && (
                        <li className="sidebar-dropdown">
                            <button 
                                className={`sidebar-dropdown-toggle ${isBasesActive ? 'active' : ''}`}
                                onClick={() => setIsBasesOpen(!isBasesOpen)}
                            >
                                <span className="sidebar-icon">{Icons.briefcase}</span>
                                <span className="sidebar-link-text">Bases</span>
                                <span className="sidebar-chevron">{Icons.chevronDown(isBasesOpen)}</span>
                            </button>
                            
                            <ul className={`sidebar-dropdown-menu ${isBasesOpen ? 'open' : ''}`}>
                                <li>
                                    <NavLink 
                                        to="/home/base-inactiva" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.briefcase}</span>
                                        Base inactiva
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink 
                                        to="/home/base-unificada" 
                                        className={({ isActive }) => isActive ? 'sidebar-link submenu-link active' : 'sidebar-link submenu-link'}
                                    >
                                        <span className="sidebar-icon">{Icons.briefcase}</span>
                                        Base unificada
                                    </NavLink>
                                </li>
                            </ul>
                        </li>
                    )}
                </ul>
            </nav>

            <div className="sidebar-footer">
                {user && <div className="sidebar-user">{user.full_name || user.login}</div>}
                {lastSession !== '' && (
                    <div className="sidebar-last-session" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Última sesión: {lastSession || 'Primera sesión registrada'}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
