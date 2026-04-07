import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logoImg from '../IMG/LOGO_MULTIVAL-removebg-preview.png';

/**
 * Sidebar vertical izquierdo con logo y navegación basada en páginas del usuario
 */
const Sidebar = () => {
    const { user } = useAuth();

    // prepare unique page list so duplicates from the backend don't show twice
    const uniquePages = [];
    if (user && user.pages) {
        const seenCodes = new Set();
        const seenNames = new Set();
        user.pages.forEach(p => {
            let page = p;
            // normalize english variant if somehow still exists
            if (page.page_code === 'USERS') {
                page = { ...page, page_code: 'USUARIOS', page_name: 'Gestión de Usuarios', route: '/usuarios' };
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

    return (
        <aside className="app-sidebar">
            <div className="sidebar-brand">
                <img src={logoImg} alt="logo" className="sidebar-logo" />
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            Inicio
                        </NavLink>
                    </li>

                    {uniquePages.map(page => (
                        <li key={page.page_code}>
                            <NavLink to={page.route} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                                {page.page_name}
                            </NavLink>
                        </li>
                    ))}


                    {user && user.role_code === 'ADMIN' && (
                        <>
                            <li>
                                <NavLink to="/role-page-access" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                                    Accesos por Rol
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/blocked-users" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                                    Usuarios Bloqueados
                                </NavLink>
                            </li>
                        </>
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
