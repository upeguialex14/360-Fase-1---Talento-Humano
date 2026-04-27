import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Selection.css';

const Selection = () => {
    const navigate = useNavigate();
    const [hoveredSide, setHoveredSide] = useState(null); // 'left' o 'right'
    const [isEntering, setIsEntering] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsEntering(false), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleNavigation = (path) => {
        setIsLeaving(true);
        setTimeout(() => navigate(path), 800); // Esperar a que termine la animación de salida
    };

    return (
        <div className={`selection-page ${isEntering ? 'page-enter' : ''} ${isLeaving ? 'page-exit' : ''}`}>
            {/* Badge superior central */}
            <div className="selection-header-badge">
                <div className="badge-content">
                    <h1>MULTIVAL</h1>
                    <p>Talento Humano 360</p>
                </div>
            </div>

            <div className="selection-container">
                {/* Lado Funcionarios (Izquierdo - Verde) */}
                <div 
                    className={`selection-side side-left ${hoveredSide === 'right' ? 'shrink' : ''} ${hoveredSide === 'left' ? 'expand' : ''}`}
                    onMouseEnter={() => setHoveredSide('left')}
                    onMouseLeave={() => setHoveredSide(null)}
                >
                    {/* Separador de onda orgánica - Ahora se mueve con el panel */}
                    <div className="curvy-separator">
                        <svg viewBox="0 0 200 1000" preserveAspectRatio="none">
                            <path 
                                d="M100,0 C220,250 -20,750 100,1000 L0,1000 L0,0 Z" 
                                fill="#00843d" 
                            />
                        </svg>
                    </div>

                    <div className="side-content">
                        <div className="side-icon-container">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h2>Funcionarios</h2>
                        <p>Acceso para personal operativo y colaboradores de la organización</p>
                        <button 
                            className="selection-btn btn-green"
                            onClick={() => handleNavigation('/upcoming')}
                        >
                            Ingresar como Funcionario
                        </button>
                    </div>
                </div>

                {/* Lado Administrativos (Derecho - Azul) */}
                <div 
                    className={`selection-side side-right ${hoveredSide === 'left' ? 'shrink' : ''} ${hoveredSide === 'right' ? 'expand' : ''}`}
                    onMouseEnter={() => setHoveredSide('right')}
                    onMouseLeave={() => setHoveredSide(null)}
                >
                    <div className="side-content">
                        <div className="side-icon-container">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <path d="m9 12 2 2 4-4"></path>
                            </svg>
                        </div>
                        <h2>Administrativos TH</h2>
                        <p>Acceso para gestión administrativa de talento humano</p>
                        <button 
                            className="selection-btn btn-blue"
                            onClick={() => handleNavigation('/login')}
                        >
                            Ingresar como Administrador
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer opcional */}
            <div className="selection-footer">
                <p>© 2026 Multival. Todos los derechos reservados.</p>
            </div>

            <div className="help-button">?</div>
        </div>
    );
};

export default Selection;
