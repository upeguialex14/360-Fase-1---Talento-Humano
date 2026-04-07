import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de navegación principal con renderizado dinámico por permisos
 */
const Navbar = () => {
    const { user } = useAuth();

    // Función helper para verificar permiso
    const hasPermission = (permissionName) => {
        if (!user || !user.permissions) return false;
        // El ADMIN tiene acceso total
        if (user.role_code === 'ADMIN') return true;
        return user.permissions.some(p => p.permission_name === permissionName);
    };

    return (
        <nav className="navbar">
            <ul className="nav-list">
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        Inicio
                    </NavLink>
                </li>

                {/* Renderizado dinámico basado en las páginas permitidas del usuario */}
                {user && user.pages && user.pages.map(page => (
                    <li key={page.page_code}>
                        <NavLink
                            to={page.route}
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        >
                            {page.page_name}
                        </NavLink>
                    </li>
                ))}

                {/* 
                  Mantenemos el ADMIN con acceso a la gestión de accesos por página 
                  aunque no esté explícitamente en la lista de pages (opcional)
                */}
                {user && user.role_code === 'ADMIN' && (
                    <li>
                        <NavLink to="/role-page-access" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Accesos por Rol
                        </NavLink>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
