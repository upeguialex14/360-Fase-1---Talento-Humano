import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * Contexto de autenticación
 */
const AuthContext = createContext(null);

/**
 * Provider del contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [forceChangePassword, setForceChangePassword] = useState(false);
    const [loading, setLoading] = useState(true);

    // Cargar datos de autenticación desde localStorage al iniciar
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedForceChange = localStorage.getItem('forceChangePassword');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setForceChangePassword(storedForceChange === 'true');
        }
        setLoading(false);
    }, []);

    /**
     * Función de login
     * @param {object} response - Respuesta del servidor { success, token, user, forceChangePassword }
     */
    const login = (response) => {
        console.log('PAYLOAD DE LOGIN EN AUTHCONTEXT:', response);
        const { token, user, forceChangePassword } = response;

        // Guardar en estado
        setToken(token);
        setUser(user);
        setForceChangePassword(forceChangePassword || false);

        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('forceChangePassword', forceChangePassword ? 'true' : 'false');
    };

    /**
     * Función de logout
     */
    const logout = async () => {
        // intentar notificar al backend (no bloqueamos por errores)
        try {
            await authService.logout();
        } catch (err) {
            console.error('[AUTH] Error al llamar logout en servidor:', err);
        }

        setToken(null);
        setUser(null);
        setForceChangePassword(false);

        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('forceChangePassword');
    };

    /**
     * Actualizar estado después de cambio de contraseña exitoso
     */
    const passwordChanged = () => {
        setForceChangePassword(false);
        localStorage.setItem('forceChangePassword', 'false');
    };

    const value = {
        user,
        token,
        forceChangePassword,
        loading,
        login,
        logout,
        passwordChanged,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;

