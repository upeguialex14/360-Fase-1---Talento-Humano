import React, { useState } from 'react';
import suriFullImg from '../IMG/SURI CUERPOCOMPLETO.png';
import suriThinkImg from '../IMG/SURI PENSATIVA.png';
import { useAuth } from '../context/AuthContext';
import IntercomunicadorChat from './IntercomunicadorChat';
import './FloatingSuri.css';

const FloatingSuri = () => {
    const { user } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Verificar si el usuario tiene acceso al INTERCOMUNICADOR
    // Inicialmente permitimos a GERENTE y ANALISTA (según requerimiento del usuario)
    // Pero idealmente se debería chequear contra user.pages o similar
    const hasAccess = user && (
        user.role_id === 1 || // Gerente
        user.role_id === 5 || // Analista
        (user.pages && user.pages.some(p => p.page_code === 'INTERCOMUNICADOR'))
    );

    if (!hasAccess) return null;

    return (
        <>
            <div 
                className={`floating-suri-container ${isChatOpen ? 'chat-active' : ''}`}
                onClick={() => setIsChatOpen(!isChatOpen)}
                title={isChatOpen ? "Cerrar Intercomunicador" : "Abrir Intercomunicador"}
            >
                <img 
                    src={isChatOpen ? suriThinkImg : suriFullImg} 
                    alt="SURI" 
                    className={`floating-suri-img ${isChatOpen ? 'animate-think' : 'animate-idle'}`} 
                />
                {!isChatOpen && <div className="suri-notification-badge">1</div>}
            </div>

            {isChatOpen && (
                <IntercomunicadorChat onClose={() => setIsChatOpen(false)} />
            )}
        </>
    );
};

export default FloatingSuri;
