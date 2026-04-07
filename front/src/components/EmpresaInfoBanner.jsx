import React from 'react';
import './EmpresaInfoBanner.css';

const EmpresaInfoBanner = () => {
    return (
        <div className="empresa-info-container">
            <h2 className="empresa-info-title">Nuestros Servicios Multival</h2>
            <div className="empresa-info-grid">
                <div className="info-item">
                    <div className="info-icon">🚚</div>
                    <p>Atención ágil y rápida</p>
                </div>
                <div className="info-item">
                    <div className="info-icon">✔️</div>
                    <p>Garantía de calidad</p>
                </div>
                <div className="info-item">
                    <div className="info-icon">🔒</div>
                    <p>Tu privacidad es nuestra prioridad</p>
                </div>
                <div className="info-item">
                    <div className="info-icon">🎧</div>
                    <p>Servicio al cliente integral</p>
                </div>
            </div>
        </div>
    );
};

export default EmpresaInfoBanner;
