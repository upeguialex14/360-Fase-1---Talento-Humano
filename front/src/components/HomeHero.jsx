import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mascotImg from '../IMG/SURI.png';
import saludoSuriImg from '../IMG/saludo SURI.png';
import suriSenalandoImg from '../IMG/SURI SEÑALANDO.png';
import logoImg from '../IMG/LOGO_MULTIVAL-removebg-preview.png';
import './HomeHero.css';

/**
 * HomeHero - Componente que reemplaza la imagen estática por cuadros interactivos
 */
const HomeHero = () => {
    const navigate = useNavigate();
    const [showSuriPanel, setShowSuriPanel] = React.useState(false);
    const [suriStep, setSuriStep] = React.useState(0);
    const [showTransition, setShowTransition] = React.useState(false);
    const [showVideo, setShowVideo] = React.useState(false);
    const videoRef = useRef(null);

    // Módulos de acceso rápido
    const quickModules = [
        { name: 'Inicio', path: '/dashboard', icon: '📊' },
        { name: 'Empleados', path: '/usuarios', icon: '👥' },
        { name: 'Costos', path: '/costos', icon: '💰' },
        { name: 'Base Datos', path: '/base-datos', icon: '📁' }
    ];

    const handleVideoClick = () => {
        // Cerrar panel SURI
        setShowSuriPanel(false);
        // Mostrar transición cinemática
        setShowTransition(true);
        // Después de la transición, mostrar video
        setTimeout(() => {
            setShowTransition(false);
            setShowVideo(true);
        }, 1200);
    };

    const handleCloseVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        setShowVideo(false);
    };

    return (
        <>
            <div className="home-hero-grid">
                {/* Cuadro Grande - Izquierda */}
                <div className="hero-card main-info-card">
                    <div className="card-content">
                        <h1 className="hero-title">Tu Portal de <br /><span>Talento Humano</span></h1>
                        <p className="hero-description">
                            Te presentamos el <strong>Área de Talento Humano</strong>, diseñada para <strong>gestionar y potenciar</strong> tu capital más valioso: las personas. Centralizamos la <strong>administración del personal</strong> y el desarrollo de competencias, garantizando el <strong>crecimiento profesional</strong> y el cumplimiento normativo en cada etapa de la carrera laboral.
                        </p>
                        <div className="card-footer-centered">
                            <img src={logoImg} alt="Multival" className="footer-logo-centered" />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className="hero-right-col">
                    {/* Cuadro Arriba Derecha - Asistente */}
                    <div className="hero-card assistant-card clickable" onClick={() => { setShowSuriPanel(true); setSuriStep(0); }}>
                        <div className="assistant-content-centered">
                            <div className="assistant-image-large">
                                <img src={mascotImg} alt="SURI" />
                            </div>
                            <div className="assistant-text-large">
                                <h3>SURI:</h3>
                                <p>Mascota del Área</p>
                            </div>
                        </div>
                    </div>

                    {/* Cuadro Abajo Derecha - Acceso Rápido */}
                    <div className="hero-card quick-access-card">
                        <p className="quick-access-tagline">Acceso rápido</p>

                        <div className="quick-access-grid">
                            {quickModules.map((module, index) => (
                                <div
                                    key={index}
                                    className="quick-item"
                                    onClick={() => navigate(module.path)}
                                >
                                    <div className="quick-icon-box">
                                        <span className="quick-icon">{module.icon}</span>
                                    </div>
                                    <span className="quick-label">{module.name}</span>
                                    <div className="quick-hover-indicator"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Panel de Saludo SURI ── */}
            {showSuriPanel && (
                <div className="suri-overlay-panel">
                    <div className="suri-panel-content animate-slide-in">
                        <button className="close-panel-btn" onClick={(e) => { e.stopPropagation(); setShowSuriPanel(false); }}>✕</button>

                        <div className="suri-panel-grid animate-fade-in" key={suriStep}>
                            <div className="suri-panel-left">
                                <img
                                    src={
                                        suriStep === 0 ? saludoSuriImg :
                                        suriStep === 1 ? suriSenalandoImg :
                                        suriStep === 2 ? mascotImg : saludoSuriImg
                                    }
                                    alt="SURI"
                                    className="suri-saludo-img"
                                />
                            </div>
                            <div className="suri-panel-right">
                                <div className="suri-message-box">
                                    {suriStep === 0 && (
                                        <>
                                            <h2>¡Hola! Me presento</h2>
                                            <p>Soy <strong>Suri</strong>, la mascota del área de Talento Humano. Conmigo encontrarás el apartado de las notificaciones y anuncios que podrás dejar a tus compañeras.</p>
                                        </>
                                    )}
                                    {suriStep === 1 && (
                                        <>
                                            <h2>¿Donde me encuentras?</h2>
                                            <p>En la parte posterior derecha podras encontrarme; al momento de darme click se desplegara el chat de el aplicativo donde podras hablar con todas las analistas para poder dejar notificaciones o preguntas al respecto de tu trabajo diario.</p>
                                        </>
                                    )}
                                    {suriStep === 2 && (
                                        <>
                                            <h2>Suri Asistente</h2>
                                            <p>La otra suri que vez abajo, que tiene el marco circular es la suri asistente. Ella es un chat bot que se alimenta con ia para resolver tus dudas y ayudarte a optimizar tus trabajos.</p>
                                        </>
                                    )}
                                    {suriStep === 3 && (
                                        <>
                                            <h2>Video Soundtrack</h2>
                                            <p>Ahora veras como canto eh interpretro el video que participa en el Soundtrack. Aqui hablo sobre lo mas importante de 360 y muestro alusivamente nuestros ideales.</p>
                                        </>
                                    )}
                                </div>

                                <div className="suri-panel-actions">
                                    <button className="suri-exit-btn" onClick={() => setShowSuriPanel(false)}>Salir</button>
                                    {suriStep === 0 && (
                                        <button className="suri-next-btn" onClick={() => setSuriStep(1)}>Siguiente</button>
                                    )}
                                    {suriStep === 1 && (
                                        <button className="suri-next-btn" onClick={() => setSuriStep(2)}>Siguiente</button>
                                    )}
                                    {suriStep === 2 && (
                                        <button className="suri-next-btn" onClick={() => setSuriStep(3)}>Siguiente</button>
                                    )}
                                    {suriStep === 3 && (
                                        <button className="suri-next-btn suri-video-btn" onClick={handleVideoClick}>
                                            ▶&nbsp;Video
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Transición Cinemática ── */}
            {showTransition && (
                <div className="video-transition-overlay">
                    <div className="transition-curtain curtain-left"></div>
                    <div className="transition-curtain curtain-right"></div>
                    <div className="transition-center-logo">
                        <img src={mascotImg} alt="SURI" className="transition-suri-img" />
                        <p className="transition-text">Preparando el video...</p>
                    </div>
                </div>
            )}

            {/* ── Modal de Video Full-Screen ── */}
            {showVideo && (
                <div className="video-fullscreen-modal">
                    <button
                        className="video-close-btn"
                        onClick={handleCloseVideo}
                        title="Cerrar video"
                    >
                        ✕
                    </button>
                    <video
                        ref={videoRef}
                        className="video-player"
                        src="/SuriSoundtrack.mp4"
                        controls
                        autoPlay
                        playsInline
                    />
                </div>
            )}
        </>
    );
};

export default HomeHero;
