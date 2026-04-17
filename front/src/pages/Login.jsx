import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import '../styles/auth.css';

/**
 * Página de Login
 */
const Login = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    /**
     * Validar que no contenga comillas
     */
    const hasQuotes = (str) => {
        return str.includes("'") || str.includes('"');
    };

    /**
     * Manejar cambios en los inputs
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(''); // Limpiar error al escribir
    };

    /**
     * Validar formulario
     */
    const validateForm = () => {
        if (!formData.login.trim()) {
            setError('El campo de usuario/email es obligatorio');
            return false;
        }

        if (!formData.password) {
            setError('La contraseña es obligatoria');
            return false;
        }

        if (formData.password.length < 5) {
            setError('La contraseña debe tener mínimo 5 caracteres');
            return false;
        }


        if (hasQuotes(formData.login) || hasQuotes(formData.password)) {
            setError('No se permiten comillas simples ni dobles');
            return false;
        }

        return true;
    };

    /**
     * Manejar envío del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login({
                login: formData.login,
                password: formData.password,
            });

            console.log('PAYLOAD DE LOGIN:', response);

            if (response.success) {
                // Guardar en contexto
                login(response);

                // Redirigir según forceChangePassword
                if (response.forceChangePassword) {
                    navigate('/change-password');
                } else {
                    navigate('/');
                }
            } else {
                // Mostrar el mensaje exacto devuelto por el backend
                setError(response.message || 'Credenciales incorrectas');
            }
        } catch (err) {
            console.error('Error de login:', err);
            setError('Error inesperado al intentar iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Iniciar Sesión</h1>
                <p className="auth-subtitle">TalentoHumano360</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="login">Usuario o Email</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ingresa tu usuario o email"
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ingresa tu contraseña"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

