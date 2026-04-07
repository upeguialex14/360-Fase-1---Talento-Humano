import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import '../styles/auth.css';

/**
 * Página de Cambio de Contraseña
 */
const ChangePassword = () => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { passwordChanged } = useAuth();
    const navigate = useNavigate();

    /**
     * Validar que no contenga comillas
     */
    const hasQuotes = (str) => {
        return str.includes("'") || str.includes('"');
    };

    /**
     * Validar que contenga letras
     */
    const hasLetters = (str) => {
        return /[a-zA-Z]/.test(str);
    };

    /**
     * Validar que contenga al menos una mayúscula
     */
    const hasUpperCase = (str) => {
        return /[A-Z]/.test(str);
    };

    /**
     * Validar que contenga al menos 2 números
     */
    const hasTwoNumbers = (str) => {
        const numbers = str.match(/\d/g);
        return numbers && numbers.length >= 2;
    };

    /**
     * Validar que contenga caracteres especiales
     */
    const hasSpecialChars = (str) => {
        return /[!@#$%^&*()_+\-=\[\]{};:,.<>?/\\|`~]/.test(str);
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
        setError('');
        setSuccess('');
    };

    /**
     * Validar formulario
     */
    const validateForm = () => {
        const { newPassword, confirmPassword } = formData;

        if (!newPassword || !confirmPassword) {
            setError('Todos los campos son obligatorios');
            return false;
        }

        if (newPassword.length < 10) {
            setError('La contraseña debe tener mínimo 10 caracteres');
            return false;
        }

        if (!hasLetters(newPassword)) {
            setError('La contraseña debe contener al menos una letra');
            return false;
        }

        if (!hasUpperCase(newPassword)) {
            setError('La contraseña debe contener al menos una letra mayúscula');
            return false;
        }

        if (!hasTwoNumbers(newPassword)) {
            setError('La contraseña debe contener al menos 2 números');
            return false;
        }

        if (!hasSpecialChars(newPassword)) {
            setError('La contraseña debe contener al menos un carácter especial');
            return false;
        }

        if (hasQuotes(newPassword)) {
            setError('No se permiten comillas simples ni dobles');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
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
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.changePassword({
                newPassword: formData.newPassword,
            });

            if (response.success) {
                setSuccess('Contraseña actualizada exitosamente');
                // Actualizar contexto
                passwordChanged();
                // Esperar 1 segundo antes de redirigir
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                setError(response.message || 'Error al cambiar la contraseña');
            }
        } catch (err) {
            setError(err.message || 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Cambiar Contraseña</h1>
                <p className="auth-subtitle">Por seguridad, debes actualizar tu contraseña</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="auth-success">
                            {success}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ingresa tu nueva contraseña"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <small className="form-hint">
                            Mínimo 10 caracteres, 1 mayúscula, 2 números, caracteres especiales, sin comillas
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Confirma tu nueva contraseña"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
