import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import logoImg from '../IMG/LOGO_MULTIVAL-removebg-preview.png';
import '../styles/auth.css';

/**
 * Página de Login Exclusiva con Google Sign-In
 */
const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    /**
     * Manejar inicio de sesión exitoso desde el botón de Google
     */
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        
        try {
            console.log('[Login] Google auth success, sending token to backend...');
            const response = await authService.googleLogin(credentialResponse.credential);

            if (response.success) {
                // Guardar en contexto (AuthContext se encarga de token y user)
                login(response);
                console.log('[Login] Login successful, redirecting to home.');
                navigate('/home');
            } else {
                setError(response.message || 'Error de autenticación en el servidor');
            }
        } catch (err) {
            console.error('[Login] Error during backend verification:', err);
            // Intentar extraer el mensaje de error del backend
            const errorMsg = err.response?.data?.message || err.message || 'Error de conexión con el servidor. Inténtalo de nuevo.';
            const isPending = err.response?.data?.isPending || false;
            
            setError(errorMsg);
            
            if (isPending) {
                // Se podría manejar un estado visual especial para "pendiente", por ahora usamos el mismo setError pero el mensaje ya indica esto.
                // Aquí podrías agregar lógica extra si quieres un icono diferente o color diferente.
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manejar error directo de la API de Google
     */
    const handleGoogleError = () => {
        console.error('[Login] Google OAuth library error returned');
        setError('No se pudo completar el inicio de sesión con Google. Intente nuevamente.');
    };

    return (
        <div className="auth-plasma-container">
            {/* Plasma blobs in background */}
            <div className="plasma-blob blob-1 animate-plasma-1"></div>
            <div className="plasma-blob blob-2 animate-plasma-2"></div>
            <div className="plasma-blob blob-3 animate-plasma-3"></div>
            <div className="scanlines animate-scanlines"></div>

            <div className="auth-glass-wrapper">
                <div className="auth-card-premium hologram-panel">
                    {/* Decorative Top Bar */}
                    <div className="card-top-bar"></div>

                    {/* Logo and Header */}
                    <div className="auth-header-section">
                        <img src={logoImg} alt="Multival Logo" className="auth-premium-logo" />
                        <h1 className="auth-title-premium font-display">Talento Humano 360</h1>
                        <p className="auth-subtitle-premium font-body">Portal Administrativo</p>
                    </div>

                    {/* Description & Instruction */}
                    <div className="auth-instruction font-body">
                        <p>Para ingresar al sistema, inicia sesión con tu cuenta de correo corporativo autorizada.</p>
                    </div>

                    {/* Google Sign-In Button Container */}
                    <div className="google-btn-container">
                        {loading ? (
                            <div className="loading-spinner-container">
                                <div className="premium-spinner"></div>
                                <span className="loading-text font-body">Verificando credenciales...</span>
                            </div>
                        ) : (
                            <div className="google-btn-wrapper">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap={false}
                                    theme="filled_blue"
                                    size="large"
                                    shape="pill"
                                    text="signin_with"
                                    width="100%"
                                />
                            </div>
                        )}
                    </div>

                    {/* Error Alerts */}
                    {error && (
                        <div className="auth-error-premium font-body animate-fadeIn">
                            <div className="error-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div className="error-message-content">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Allowed Domains Badge */}
                    <div className="allowed-domains-card font-body">
                        <span className="badge-title">Dominios autorizados:</span>
                        <div className="domains-list">
                            <span className="domain-tag">@multipagas.com</span>
                            <span className="domain-tag">@reval.com.co</span>
                            <span className="domain-tag">@multival.com.co</span>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="auth-card-footer font-body">
                        <p>© 2026 Multival S.A. Todos los derechos reservados.</p>
                        <p className="footer-support">¿Problemas para acceder? Contacta a Soporte TI.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;


