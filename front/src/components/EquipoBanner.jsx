import React, { useState } from 'react';
import './EquipoBanner.css';
import admonImg from '../IMG/Admon_Palmira-removebg-preview.png';

const EquipoBanner = ({ showHeader = true }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes agregar la lógica para enviar el mensaje
        console.log('Formulario enviado:', formData);
        // Limpiar el formulario
        setFormData({
            nombre: '',
            email: '',
            asunto: '',
            mensaje: ''
        });
        alert('Mensaje enviado correctamente');
    };

    return (
        <div className={`equipo-banner-container ${showHeader ? '' : 'no-header'}`}>
            {showHeader && (
                <>
                    <div className="equipo-banner-text">
                        <h3>Haz equipo con nosotros</h3>
                    </div>
                    <img src={admonImg} alt="Equipo" className="equipo-banner-img" />
                </>
            )}
            {/* Sección de Contacto e Info */}
            <div className="contacto-section">
                <div className="contacto-content">
                    {/* Columna izquierda: Información de contacto */}
                    <div className="info-column">
                        <div className="info-item">
                            <h4>Dirección:</h4>
                            <p>Cl. 30 #28-63</p>
                        </div>
                        <div className="info-item">
                            <h4>Teléfono:</h4>
                            <p>316-467-9828</p>
                        </div>
                        <div className="info-item">
                            <h4>Correo:</h4>
                            <p>Sirley.cardona@multipagas.com</p>
                        </div>
                    </div>

                    {/* Columna derecha: Formulario de contacto */}
                    <div className="form-column">
                        <h3 className="form-title">Contactanos</h3>
                        <p className="form-subtitle">Envianos tus datos y nos pondremos en contacto contigo</p>
                        
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-row">
                                <input 
                                    type="text" 
                                    name="nombre" 
                                    placeholder="Nombre*" 
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Correo electrónico*" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <input 
                                type="text" 
                                name="asunto" 
                                placeholder="Asunto*" 
                                value={formData.asunto}
                                onChange={handleInputChange}
                                required
                                className="form-input full-width"
                            />

                            <textarea 
                                name="mensaje" 
                                placeholder="Escribe tu mensaje*" 
                                value={formData.mensaje}
                                onChange={handleInputChange}
                                required
                                className="form-textarea"
                                rows="6"
                            />

                            <div className="form-checkboxes">
                                <label className="checkbox-label">
                                    <input type="checkbox" required />
                                    <span><a href="#" className="link">Acepto Términos y Condiciones</a></span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" required />
                                    <span><a href="#" className="link">Acepto Política de privacidad</a></span>
                                </label>
                            </div>

                            <button type="submit" className="submit-btn">Enviar mensaje</button>
                        </form>
                    </div>
                </div>

                {/* Mapa a ancho completo - Debajo */}
                <div className="map-full-width">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.1544892841395!2d-76.30193542346625!3d3.5268989010471936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3a04e67ac17e8f%3A0x9af6560aa6066360!2sCl.%2030%20%2328-63%2C%20Palmira%2C%20Valle%20del%20Cauca!5e0!3m2!1ses!2sco!4v1614556753159"
                        width="100%" 
                        height="400" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="map-iframe-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default EquipoBanner;
