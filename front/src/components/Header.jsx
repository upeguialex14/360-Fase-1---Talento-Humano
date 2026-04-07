import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente Header de la aplicación
 */
const Header = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <h1>TalentoHumano360</h1>
                </Link>
                {isAuthenticated && (
                    <div className="header-actions">
                        {user && (
                            <span className="header-user-info">👤 {user.full_name || user.login}</span>
                        )}

                        {user?.role_code === 'ADMIN' && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('¿Forzar expiración de contraseña para esta cuenta? (Función de demostración)')) {
                                        try {
                                            const token = localStorage.getItem('token');
                                            const res = await fetch('http://localhost:3000/api/auth/force-expire-demo', {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });
                                            const data = await res.json();
                                            alert(data.message);
                                            if (data.success) {
                                                logout();
                                                navigate('/login');
                                            }
                                        } catch (err) {
                                            alert('Error al ejecutar demo');
                                        }
                                    }
                                }}
                                className="demo-button"
                                title="Fuerza expiración de contraseña (Demo)"
                            >
                                Forzar cambio (Demo)
                            </button>
                        )}

                        <button onClick={handleLogout} className="logout-button" title="Cerrar sesión">
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
