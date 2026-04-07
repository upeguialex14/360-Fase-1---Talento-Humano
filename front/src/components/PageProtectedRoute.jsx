import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas dinámicas de páginas
 * Valida que el usuario tenga permiso para visualizar la página
 * 
 * @param {ReactNode} children - Componente a renderizar si tiene acceso
 * @param {string} requiredPageCode - Código de página requerida (ej: "USUARIOS")
 * @param {boolean} isOptional - Si es true, no bloquea si no está en la lista (para admin)
 */
const PageProtectedRoute = ({ children, requiredPageCode, isOptional = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <p>Cargando...</p>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si es opcional (ejemplo: ADMIN tiene acceso a todo), permitir siempre
    // O si es ADMIN, permitir acceso (tienen privilegios totales)
    if (isOptional || user.role_code === 'ADMIN') {
        return children;
    }

    // Si no hay páginas permitidas, denegar acceso
    if (!user.pages || !Array.isArray(user.pages)) {
        return <Navigate to="/" replace />;
    }

    // Buscar si el usuario tiene acceso a esta página
    const hasAccess = user.pages.some(
        page => page.page_code === requiredPageCode && page.can_view === 1
    );

    // Si no tiene acceso, redirigir al home
    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PageProtectedRoute;
