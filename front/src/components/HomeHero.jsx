import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mascotImg from '../IMG/mascota_de_th.png';
import logoImg from '../IMG/LOGO_MULTIVAL-removebg-preview.png';
import './HomeHero.css';

/**
 * HomeHero - Componente que reemplaza la imagen estática por cuadros interactivos
 */
const HomeHero = () => {
    const navigate = useNavigate();

    // Módulos de acceso rápido (pueden venir de un config global en el futuro)
    const quickModules = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Empleados', path: '/usuarios', icon: '👥' },
        { name: 'Costos', path: '/costos', icon: '💰' },
        { name: 'Base Datos', path: '/base-datos', icon: '📁' }
    ];


    return (
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
                <div className="hero-card assistant-card">
                    <div className="assistant-content-centered">
                        <div className="assistant-image-large">
                            <img src={mascotImg} alt="Docu" />
                        </div>
                        <div className="assistant-text-large">
                            <h3>Docu:</h3>
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
    );
};

export default HomeHero;
