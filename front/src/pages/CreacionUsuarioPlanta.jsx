import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// Sub-componente para el dropdown personalizado con estética "Liquid Ether"
const CustomDropdown = ({ label, name, value, options, onChange, placeholder = "Seleccione..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => 
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange({ target: { name, value: option } });
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`form-group ${isOpen ? 'dropdown-active' : ''}`} ref={dropdownRef} style={{ zIndex: isOpen ? 1000 : 1 }}>
            <label>{label}</label>
            <div className="custom-select-container">
                <div 
                    className={`custom-select-toggle ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span style={{ opacity: value ? 1 : 0.6 }}>{value || placeholder}</span>
                    <span className="dropdown-arrow" style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
                        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        color: '#FFCD04' 
                    }}>
                        ▼
                    </span>
                </div>

                {isOpen && (
                    <div className="custom-select-menu custom-scrollbar">
                        <div className="custom-select-search">
                            <input 
                                type="text" 
                                placeholder="Escriba para buscar..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="search-glow"></div>
                        </div>
                        <div className="custom-select-options">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt, index) => (
                                    <div 
                                        key={index}
                                        className={`custom-select-option ${value === opt ? 'selected' : ''}`}
                                        onClick={() => handleSelect(opt)}
                                    >
                                        <span className="option-text">{opt}</span>
                                        {value === opt && <span className="selected-indicator"></span>}
                                    </div>
                                ))
                            ) : (
                                <div className="custom-select-option no-results">
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmailAutocompleteInput = ({ label, name, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const allowedDomains = ["multival.com.co", "reval.com.co", "multipagas.com"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(e);
        
        if (val.includes('@')) {
            const domainPart = val.split('@')[1];
            if (!allowedDomains.includes(domainPart)) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        } else {
            setIsOpen(false);
        }
    };

    const handleSelectDomain = (domain) => {
        const username = value.split('@')[0] || '';
        const newValue = `${username}@${domain}`;
        onChange({ target: { name, value: newValue } });
        setIsOpen(false);
    };

    const handleBlur = () => {
        // Validación estricta en blur para prevenir dominios no permitidos
        if (value && value.includes('@')) {
            const domainPart = value.split('@')[1];
            if (domainPart && !allowedDomains.includes(domainPart)) {
                 const username = value.split('@')[0];
                 onChange({ target: { name, value: `${username}@` } });
            }
        }
    };

    return (
        <div className={`form-group ${isOpen ? 'dropdown-active' : ''}`} ref={dropdownRef} style={{ zIndex: isOpen ? 1000 : 1, position: 'relative' }}>
            <label>{label}</label>
            <input 
                type="email" 
                name={name} 
                className="planta-input" 
                value={value} 
                onChange={handleInputChange} 
                onBlur={handleBlur}
                placeholder={placeholder} 
                autoComplete="off"
            />
            
            {isOpen && (
                <div className="custom-select-menu custom-scrollbar" style={{ top: '100%', marginTop: '5px', maxHeight: '150px' }}>
                    <div className="custom-select-options">
                        {allowedDomains.map((domain, index) => (
                            <div 
                                key={index}
                                className="custom-select-option"
                                onMouseDown={(e) => { e.preventDefault(); handleSelectDomain(domain); }} 
                            >
                                <span className="option-text">@{domain}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CreacionUsuarioPlanta = () => {
    const [formData, setFormData] = useState({
        empleador: '',
        cedula: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        nombre_completo: '',
        cargo: '',
        usuario_ad: '',
        fecha_ingreso: '',
        contrato: '',
        tipo_empleado: '',
        regional: '',
        zona: '',
        ciudad: '',
        unidad_negocio: '',
        cliente: '',
        empresa: '',
        cod_ptr: '',
        cc_helisa: '',
        oficina: '',
        vacante_sob: '',
        planta_aprob: '',
        supervisor_gerente: '',
        status: 'ACTIVO',
        novedad: '',
        motivo_retiro: '',
        fecha_inicial: '',
        fecha_final: '',
        fecha_retiro: '',
        destino_traslado: '',
        dias_ausencia: '',
        observacion: '',
        jornada: '',
        correo: '',
        estado: '',
        banco: '',
        cuenta: '',
        tipo_cuenta: '',
        requiere_correo: 'no',
        correo_corp: '',
        dominio_correo: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Estados para gestión de credenciales en modal premium
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper para limpiar el texto de tildes, caracteres especiales y dejarlo en minúsculas
    const cleanText = (text) => {
        if (!text) return '';
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove accents
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "") // remove special characters except spaces
            .trim();
    };

    // Lógica para componer automáticamente el nombre completo a partir de los campos individuales
    useEffect(() => {
        const fullname = [
            formData.primer_nombre,
            formData.segundo_nombre,
            formData.primer_apellido,
            formData.segundo_apellido
        ].filter(Boolean).map(s => s.trim()).join(' ');

        setFormData(prev => ({
            ...prev,
            nombre_completo: fullname
        }));
    }, [formData.primer_nombre, formData.segundo_nombre, formData.primer_apellido, formData.segundo_apellido]);

    // Lógica para sugerir dominio al cambiar de empresa
    useEffect(() => {
        if (formData.empresa) {
            let dom = '@reval.com.co';
            if (formData.empresa.toUpperCase() === 'MULTIPAGAS') {
                dom = '@multipagas.com';
            } else if (formData.empresa.toUpperCase() === 'MULTIVAL') {
                dom = '@multival.com.co';
            }
            setFormData(prev => ({
                ...prev,
                dominio_correo: dom
            }));
        }
    }, [formData.empresa]);

    // Lógica para auto-generación del correo corporativo
    useEffect(() => {
        if (formData.requiere_correo === 'si' && formData.primer_nombre && formData.primer_apellido) {
            const pNombre = cleanText(formData.primer_nombre);
            const pApellido = cleanText(formData.primer_apellido);

            if (pNombre && pApellido) {
                const dom = formData.dominio_correo || '@reval.com.co';
                const email = `${pNombre}.${pApellido}${dom}`;
                setFormData(prev => ({
                    ...prev,
                    correo_corp: email
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    correo_corp: ''
                }));
            }
        } else if (formData.requiere_correo === 'no') {
            setFormData(prev => ({
                ...prev,
                correo_corp: ''
            }));
        }
    }, [formData.requiere_correo, formData.primer_nombre, formData.primer_apellido, formData.dominio_correo]);

    // Lógica para auto-llenado al seleccionar oficina
    useEffect(() => {
        const fetchOficinaDetails = async () => {
            if (formData.oficina && formData.oficina !== '') {
                try {
                    const response = await api.get(`/planta-operacion/oficina/${formData.oficina}`);
                    if (response && response.success && response.data) {
                        const details = response.data;
                        setFormData(prev => ({
                            ...prev,
                            regional: details.regional || prev.regional,
                            zona: details.zona || prev.zona,
                            ciudad: details.ciudad || prev.ciudad,
                            cod_ptr: details.ptr || prev.cod_ptr,
                            cc_helisa: details.helisa_cc || prev.cc_helisa,
                            supervisor_gerente: details.supervisor || prev.supervisor_gerente
                        }));
                    }
                } catch (error) {
                    // Silenciamos los errores de búsqueda para no ensuciar la consola
                    // ya que es normal que algunas oficinas no tengan datos maestros vinculados
                }
            }
        };

        fetchOficinaDetails();
    }, [formData.oficina]);

    // Lógica para auto-llenar usuario_ad con la inicial del primer nombre, segundo nombre (si aplica) y el primer apellido
    useEffect(() => {
        const pNombre = cleanText(formData.primer_nombre);
        const sNombre = cleanText(formData.segundo_nombre);
        const pApellido = cleanText(formData.primer_apellido);
        
        if (pNombre && pApellido) {
            const initial1 = pNombre.charAt(0);
            const initial2 = sNombre ? sNombre.charAt(0) : '';
            const usernameAd = `${initial1}${initial2}${pApellido}`.toLowerCase();
            setFormData(prev => ({
                ...prev,
                usuario_ad: usernameAd
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                usuario_ad: ''
            }));
        }
    }, [formData.primer_nombre, formData.segundo_nombre, formData.primer_apellido]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.correo || formData.correo.trim() === '') {
            setMessage({ type: 'error', text: '⚠️ El Correo Personal es obligatorio para poder enviar las credenciales.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post('/planta-operacion', formData);
            
            if (response && response.success) {
                // Configurar credenciales y abrir modal premium
                setCreatedCredentials(response.credentials);
                setShowCredentialsModal(true);

                setMessage({ 
                    type: 'success', 
                    text: `✅ Colaborador registrado exitosamente en la base de datos local.` 
                });

                // Limpiar campos específicos del formulario para el siguiente registro
                setFormData(prev => ({
                    ...prev,
                    primer_nombre: '',
                    segundo_nombre: '',
                    primer_apellido: '',
                    segundo_apellido: '',
                    cedula: '',
                    correo: '',
                    correo_corp: '',
                    usuario_ad: ''
                }));
            } else {
                throw new Error(response?.message || 'Error de negocio al registrar en el servidor');
            }
        } catch (error) {
            console.error('Error al registrar usuario planta:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Error al conectar con el servidor para registrar el usuario.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ padding: '2rem' }}>
            <style>{`
                .planta-form-card {
                    background: rgba(15, 19, 34, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 3rem;
                    max-width: 1200px;
                    margin: 2rem auto;
                    backdrop-filter: blur(25px) saturate(180%);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    position: relative;
                }
                .planta-form-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: linear-gradient(90deg, transparent, #FFCD04, transparent);
                }
                .planta-form-header {
                    margin-bottom: 3rem;
                    position: relative;
                }
                .planta-form-header h1 {
                    color: #FFCD04;
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-shadow: 0 0 20px rgba(255, 205, 4, 0.3);
                }
                .form-section {
                    margin-bottom: 3.5rem;
                    animation: sectionFadeIn 0.6s ease-out forwards;
                    position: relative;
                }
                /* Jerarquía de capas para que los dropdowns superiores siempre cubran lo de abajo */
                .form-section:nth-child(1) { z-index: 10; }
                .form-section:nth-child(2) { z-index: 9; }
                .form-section:nth-child(3) { z-index: 8; }
                .form-section:nth-child(4) { z-index: 7; }
                .form-section:nth-child(5) { z-index: 6; }
                .form-section:nth-child(6) { z-index: 5; }
                .form-section:nth-child(7) { z-index: 4; }

                .form-section:focus-within {
                    z-index: 100 !important;
                }
                @keyframes sectionFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .form-section-title {
                    color: #FFCD04;
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    opacity: 0.9;
                }
                .form-section-title::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255, 205, 4, 0.3), transparent);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                    position: relative;
                    transition: z-index 0.3s step-start;
                }
                .form-group.dropdown-active {
                    z-index: 9999 !important;
                }
                .form-group label {
                    color: #94a3b8;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding-left: 4px;
                }
                .planta-input {
                    background: rgba(15, 19, 34, 0.8) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 0.8rem 1.2rem;
                    color: #ffffff !important;
                    font-size: 1rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    width: 100%;
                    backdrop-filter: blur(10px);
                }
                .planta-input:focus {
                    outline: none;
                    border-color: #FFCD04 !important;
                    box-shadow: 0 0 20px rgba(255, 205, 4, 0.15);
                    background: rgba(255, 255, 255, 0.05) !important;
                    transform: translateY(-1px);
                }

                /* Custom Dropdown Styles - Premium "Liquid Ether" */
                .custom-select-container {
                    position: relative;
                    width: 100%;
                }
                .custom-select-toggle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-left: 4px solid rgba(255, 205, 4, 0.6);
                    border-radius: 10px;
                    padding: 0.8rem 1.2rem;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    font-size: 1rem;
                    backdrop-filter: blur(10px);
                }
                .custom-select-toggle:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.25);
                    border-left-color: #FFCD04;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    transform: translateX(4px);
                }
                .custom-select-toggle.open {
                    border-color: #FFCD04;
                    border-left-color: #FFCD04;
                    background: rgba(15, 19, 34, 0.9);
                    box-shadow: 0 0 25px rgba(255, 205, 4, 0.2);
                }
                .custom-select-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: #111827; /* Fondo sólido para evitar confusión de transparencia */
                    border: 1px solid rgba(255, 205, 4, 0.5);
                    border-radius: 12px;
                    z-index: 10000 !important;
                    max-height: 350px;
                    overflow-y: auto;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
                    animation: dropdownSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes dropdownSlideUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-select-search {
                    position: sticky;
                    top: 0;
                    background: #111827;
                    padding: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 11;
                }
                .custom-select-search input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 8px;
                    padding: 10px 15px;
                    color: #fff;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                }
                .custom-select-search input:focus {
                    outline: none;
                    border-color: #FFCD04;
                    background: rgba(255, 205, 4, 0.05);
                }
                .custom-select-option {
                    padding: 12px 20px;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 0.95rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-left: 4px solid transparent;
                }
                .custom-select-option:hover {
                    background: linear-gradient(90deg, rgba(255, 205, 4, 0.15) 0%, transparent 100%);
                    color: #fff;
                    border-left-color: #FFCD04;
                    padding-left: 28px;
                }
                .custom-select-option.selected {
                    background: rgba(255, 205, 4, 0.2);
                    color: #FFCD04;
                    font-weight: 700;
                    border-left-color: #FFCD04;
                }
                .selected-indicator {
                    width: 8px;
                    height: 8px;
                    background: #FFCD04;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #FFCD04;
                }
                .no-results {
                    opacity: 0.5;
                    cursor: default;
                    justify-content: center;
                    padding: 30px !important;
                }

                .btn-save {
                    background: linear-gradient(135deg, #FFCD04 0%, #e5b804 100%);
                    color: #000;
                    border: none;
                    border-radius: 12px;
                    padding: 1.2rem 3rem;
                    font-size: 1.1rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    margin-top: 3rem;
                    width: 100%;
                    box-shadow: 0 10px 25px rgba(255, 205, 4, 0.2);
                }
                .btn-save:hover:not(:disabled) {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 15px 35px rgba(255, 205, 4, 0.4);
                }
                .btn-save:active {
                    transform: translateY(0);
                }
                .message-banner {
                    padding: 1.2rem;
                    border-radius: 12px;
                    margin-bottom: 2.5rem;
                    text-align: center;
                    font-weight: 600;
                    backdrop-filter: blur(10px);
                }
                .message-banner.success {
                    background: rgba(34, 197, 94, 0.15);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
                }
                .message-banner.error {
                    background: rgba(239, 68, 68, 0.15);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                
                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 205, 4, 0.4);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #FFCD04;
                }

                /* Segmented toggle for Requires Email */
                .requires-email-toggle {
                    display: flex;
                    background: rgba(15, 19, 34, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 4px;
                    gap: 4px;
                }
                .toggle-btn {
                    flex: 1;
                    padding: 0.6rem;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                    font-weight: 700;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                }
                .toggle-btn:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.05);
                }
                .toggle-btn.btn-no.active {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
                }
                .toggle-btn.btn-yes.active {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.4);
                    text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
                }
                .corporate-email-input {
                    background: rgba(255, 205, 4, 0.05) !important;
                }
                .info-text {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-top: -2px;
                    padding-left: 4px;
                }
                .correo-corp-group {
                    animation: fadeInSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeInSlideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Premium Credentials Modal Styles */
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(4, 6, 15, 0.85);
                    backdrop-filter: blur(20px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 999999 !important;
                    animation: backdropFadeIn 0.3s ease-out forwards;
                }
                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .credentials-modal {
                    background: rgba(15, 19, 34, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    width: 90%;
                    max-width: 650px;
                    padding: 2.5rem;
                    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(255, 205, 4, 0.05);
                    animation: modalScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    position: relative;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                @keyframes modalScaleUp {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .credentials-modal-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .credentials-modal-header h2 {
                    color: #FFCD04;
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin: 0 0 0.5rem 0;
                    text-shadow: 0 0 20px rgba(255, 205, 4, 0.2);
                }
                .credentials-modal-header p {
                    color: #94a3b8;
                    font-size: 0.95rem;
                    margin: 0;
                }
                .credentials-cards-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    margin-bottom: 2rem;
                }
                .credential-card {
                    background: rgba(30, 41, 59, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 1.2rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.2rem;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                }
                .credential-card:hover {
                    background: rgba(30, 41, 59, 0.6);
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateX(4px);
                }
                .credential-card.selected.ad { border-left: 5px solid #4A90E2; box-shadow: -10px 0 20px rgba(74, 144, 226, 0.05); }
                .credential-card.selected.email { border-left: 5px solid #2ECC71; box-shadow: -10px 0 20px rgba(46, 204, 113, 0.05); }
                .credential-card.selected.osticket { border-left: 5px solid #FFCD04; box-shadow: -10px 0 20px rgba(255, 205, 4, 0.05); }
                
                .credential-checkbox-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .credential-checkbox {
                    width: 22px;
                    height: 22px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s;
                }
                .credential-card.selected .credential-checkbox {
                    border-color: currentColor;
                    background: currentColor;
                }
                .credential-checkbox::after {
                    content: '✓';
                    color: #000;
                    font-size: 14px;
                    font-weight: 900;
                    display: none;
                }
                .credential-card.selected .credential-checkbox::after {
                    display: block;
                }
                .credential-card.ad { color: #4A90E2; }
                .credential-card.email { color: #2ECC71; }
                .credential-card.osticket { color: #FFCD04; }
                
                .credential-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    color: #fff;
                }
                .credential-title-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .credential-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 2px 8px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.08);
                }
                .credential-card.ad .credential-badge { color: #4A90E2; background: rgba(74, 144, 226, 0.1); }
                .credential-card.email .credential-badge { color: #2ECC71; background: rgba(46, 204, 113, 0.1); }
                .credential-card.osticket .credential-badge { color: #FFCD04; background: rgba(255, 205, 4, 0.1); }
                
                .credential-failed-badge {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .credential-field {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    padding: 6px 12px;
                    margin-top: 4px;
                    font-family: monospace;
                    font-size: 0.9rem;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                }
                .credential-value {
                    color: #e2e8f0;
                    user-select: all;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 320px;
                }
                .btn-copy-small {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 2px 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .btn-copy-small:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.1);
                }
                .btn-copy-small.copied {
                    color: #2ECC71 !important;
                }

                .modal-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-top: 2rem;
                }
                .btn-close-modal {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 0.9rem 2rem;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                }
                .btn-close-modal:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .auto-send-notice {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    background: rgba(34, 197, 94, 0.08);
                    border: 1px solid rgba(34, 197, 94, 0.25);
                    border-radius: 12px;
                    padding: 14px 18px;
                    margin-top: 1.5rem;
                }
                .auto-send-notice .notice-icon {
                    font-size: 1.4rem;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .auto-send-notice .notice-text {
                    color: #86efac;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }
                .auto-send-notice .notice-text strong {
                    color: #4ade80;
                    display: block;
                    margin-bottom: 3px;
                    font-size: 0.95rem;
                }
            `}</style>

            <div className="planta-form-card">
                <header className="planta-form-header">
                    <h1>📝 Registro Nuevo Usuario Planta</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Ingrese la información detallada para el alta en Planta Operación</p>
                </header>

                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Sección 1: Información Básica */}
                    <div className="form-section">
                        <div className="form-section-title">Información Básica</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Empleador</label>
                                <input type="text" name="empleador" className="planta-input" value={formData.empleador} onChange={handleChange} placeholder="Ej: NEXUS 360" />
                            </div>

                            <div className="form-group">
                                <label>Cédula</label>
                                <input type="text" name="cedula" className="planta-input" value={formData.cedula} onChange={handleChange} required placeholder="Número de identificación" />
                            </div>

                            <div className="form-group">
                                <label>Primer Nombre</label>
                                <input type="text" name="primer_nombre" className="planta-input" value={formData.primer_nombre} onChange={handleChange} required placeholder="Primer nombre" />
                            </div>

                            <div className="form-group">
                                <label>Segundo Nombre</label>
                                <input type="text" name="segundo_nombre" className="planta-input" value={formData.segundo_nombre} onChange={handleChange} placeholder="Segundo nombre (Opcional)" />
                            </div>

                            <div className="form-group">
                                <label>Primer Apellido</label>
                                <input type="text" name="primer_apellido" className="planta-input" value={formData.primer_apellido} onChange={handleChange} required placeholder="Primer apellido" />
                            </div>

                            <div className="form-group">
                                <label>Segundo Apellido</label>
                                <input type="text" name="segundo_apellido" className="planta-input" value={formData.segundo_apellido} onChange={handleChange} placeholder="Segundo apellido (Opcional)" />
                            </div>

                            <CustomDropdown 
                                label="Cargo" 
                                name="cargo" 
                                value={formData.cargo} 
                                options={[
                                    "ANALISTA BACK I", "ANALISTA BACK OFFICE - POSVENTA", "ANALISTA BACK TECNOLOGIA", "ANALISTA COMERCIAL",
                                    "ANALISTA CONTABLE - VIATICOS Y ALQUILERES", "ANALISTA CONTABLE - FACTURACIÓN DE VENTA Y CARTERA",
                                    "ANALISTA DE CARTERA", "ANALISTA DE CONCILIACION", "ANALISTA DE GESTIÓN DOCUMENTAL", "ANALISTA DE IMPUESTOS",
                                    "ANALISTA DE MERCADEO", "ANALISTA DE NOMINA", "ANALISTA DE POLIGRAFIA", "ANALISTA DE PREVENCIÓN RIESGO EN PERSONAS",
                                    "ANALISTA DE PREVENCIÓN RIESGOS EN PROCESOS", "ANALISTA DE SEGURIDAD DE LA INFORMACIÓN",
                                    "ANALISTA DE SEGURIDAD Y SALUD EN EL TRABAJO VI", "ANALISTA DE SELECCIÓN", "ANALISTA DE TALENTO HUMANO",
                                    "ANALISTA MI ATM", "ANALISTA NOMINA", "ANALISTA OPERATIVO", "ANALISTA OPERATIVO BACK V",
                                    "ANALISTA PREVENCION DE PROCESOS", "ANALISTA TALENTO HUMANO", "APERTURA DE CUENTAS", "APRENDIZ SENA",
                                    "APRENDIZ SENA FIJO LECTIVO", "APRENDIZ SENA LECTIVO", "ASESOR COMERCIAL", "ASESOR COMERCIAL BALM",
                                    "ASESOR COMERCIAL POSVENTA", "AUDITOR DE CONTROL INTERNO", "AUXILIAR ADMINISTRATIVO", "AUXILIAR BACK",
                                    "AUXILIAR BACK I", "AUXILIAR BACK OFFICE", "AUXILIAR CONTABLE", "AUXILIAR CONTABLE - TRAFICO DE FACTURACIÓN",
                                    "AUXILIAR DE BODEGA", "AUXILIAR DE CONCILIACION", "AUXILIAR DE MONITOREO", "AUXILIAR DE MONITOREO ALTO RIESGO",
                                    "AUXILIAR DE OPERACIONES", "AUXILIAR DE OPERACIONES - CELULA", "AUXILIAR DE OPERACIONES (MESA DE CONTROL)",
                                    "AUXILIAR DE OPERACIONES (REVISION DOCUMENTAL)", "AUXILIAR DE OPERACIONES BACK OFFICE - CALI",
                                    "AUXILIAR DE SELECCION", "AUXILIAR DE SERVICIOS GENERALES", "AUXILIAR DE SST Y BIENESTAR",
                                    "AUXILIAR MESA DE CONTROL", "AUXILIAR OPERATIVO", "AUXILIAR RECURSOS FISICOS", "AUXILIAR SERVICIOS GENERALES",
                                    "CAJERO", "CAJERO COMPENSADOR", "CAJERO DIRECTOR U.E", "CAJERO PRINCIPAL I", "CAJERO PRINCIPAL II",
                                    "CAJERO RECAUDADOR I", "CAJERO RECAUDADOR II", "CAJERO SEGUNDO I", "CAJERO SEGUNDO II", "CAJERO SUPERNUMERARIO",
                                    "COMPENSADOR", "COMPENSADOR /DIRECCIONADOR 6 HORAS", "CONDUCTOR", "COORDINADOR BPO",
                                    "COORDINADOR DE BPO Y BACK OFFICE", "COORDINADOR DE MONITOREO JUNIOR", "COORDINADOR DE OPERACIONES",
                                    "COORDINADOR GESTORIA DE RED", "COORDINADOR NACIONAL", "COORDINADOR OPERATIVO", "DIRECCIONADOR",
                                    "DIRECTOR ADMINISTRATIVO", "DIRECTOR COMERCIAL", "DIRECTOR CONTABLE", "DIRECTOR DE CONTROL INTERNO",
                                    "DIRECTOR DE GESTION HUMANA", "DIRECTOR DE PREVENCION DE RIESGO", "DIRECTOR DE TECNOLOGIA",
                                    "DIRECTOR FINANCIERO", "DIRECTOR NUEVOS PROYECTOS", "DIRECTORA COMERCIAL", "DIRECTORA SUBSIDIOS",
                                    "FORMADOR", "GERENTE", "GERENTE COMERCIA REGIONAL", "GERENTE COMERCIAL", "GERENTE COMERCIAL REGIONAL",
                                    "GERENTE CORPORATIVO", "GERENTE DE INNOVACION", "GERENTE NACIONAL ADMINISTRATIVO Y DE OPERACIONES",
                                    "GESTION ADMINISTRATIVA Y DE CARTERA", "GESTOR COMERCIAL", "GESTOR DE NEGOCIOS RRT", "GESTOR DE RED",
                                    "GESTOR TECNOLÓGICO", "INGENIERO DE INFRAESTRUCTURA", "INGENIERO DE SISTEMAS",
                                    "INGENIERO DE TECNOLOGIAS DE LA INFORMACIÓN IX", "INGENIERO DESARROLLADOR", "INGENIERO QA",
                                    "JEFE DE SERVICIO I", "LIDER DE CONCILIACIÓN", "LIDER DE EXCELENCIA", "LIDER DE EXCELENCIA RED MI ATM",
                                    "LIDER DE GESTION TECNOLOGICA", "LÍDER DE IMPUESTOS", "LIDER DE OPERACIONES",
                                    "LIDER DE RECURSOS FISICOS Y ADMINISTRATIVOS", "LIDER DE TALENTO HUMANO", "LIDER GESTION DEL NEGOCIO",
                                    "LIDER JURIDICO", "MENSAJERO", "OFICIOS VARIOS", "ORIENTADOR", "SUPERVISOR CGM", "SUPERVISOR OPERATIVO II",
                                    "SUPERVISOR OPERATIVO IV", "TECNICO EN SISTEMA Y TELECOMUNICACIONES", "TECNICO EN SISTEMAS", "VACANTE"
                                ]} 
                                onChange={handleChange} 
                            />

                            <div className="form-group">
                                <label>Usuario AD (Automático)</label>
                                <input 
                                    type="text" 
                                    name="usuario_ad" 
                                    className="planta-input" 
                                    value={formData.usuario_ad} 
                                    readOnly 
                                    placeholder="Se genera desde la cédula" 
                                    style={{ opacity: 0.8, cursor: 'not-allowed', backgroundColor: 'rgba(0,0,0,0.3)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Vinculación Territorial */}
                    <div className="form-section">
                        <div className="form-section-title">Vinculación Territorial</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Fecha Ingreso</label>
                                <input type="date" name="fecha_ingreso" className="planta-input" value={formData.fecha_ingreso} onChange={handleChange} />
                            </div>

                            <CustomDropdown 
                                label="Contrato" 
                                name="contrato" 
                                value={formData.contrato} 
                                options={[
                                    "APRENDIZ FIJO LECTIVO", "APRENDIZAJE", "FIJO", "FIJO 4 HORAS", "FIJO 6 HORAS", "INDEFINIDO",
                                    "INDEFINIDO 4 HORAS", "INDEFINIDO 6 HORAS", "INDEFINIDO -DIAS", "INTEGRAL", "OBRA LABOR 4 HORAS",
                                    "OBRA LABOR 6 HORAS", "OBRA O LABOR"
                                ]} 
                                onChange={handleChange} 
                            />

                            <CustomDropdown 
                                label="Tipo Empleado" 
                                name="tipo_empleado" 
                                value={formData.tipo_empleado} 
                                options={["OPERATIVO FRONT", "ADMINISTRATIVO", "COMERCIAL", "OPERATIVO"]} 
                                onChange={handleChange} 
                            />

                            <CustomDropdown 
                                label="Regional" 
                                name="regional" 
                                value={formData.regional} 
                                options={[
                                    "ZONA BOGOTA", "ADMINISTRACION", "NORORIENTE", "ANTIOQUIA Y SABANAS", "BOGOTÁ Y CENTRO",
                                    "EJE CAFETERO Y SUR", "ZONA CENTRO", "ZONA OCCIDENTE", "ZONA NORTE", "ZONA MEDELLIN",
                                    "BOGOTÁ", "GESTORIA ANTIOQUIA Y SABANAS", "GESTORIA BOGOTA Y CENTRO", "ZONA ORIENTE",
                                    "ZONA ANTIOQUIA", "BOGOTA Y CENTRO", "ZONA SUPERVISOR", "TROPAS ANTIOQUIA Y SABANAS",
                                    "TROPAS BOGOTA Y CENTRO", "TROPAS SUR", "TROPAS EJE CAFETERO"
                                ]} 
                                onChange={handleChange} 
                            />

                            <CustomDropdown 
                                label="Zona" 
                                name="zona" 
                                value={formData.zona} 
                                options={[
                                    "ZONA BOGOTA", "ADMINISTRACION", "CESAR Y GUAJIRA", "ANTIOQUIA SUR", "HUILA Y SUR", "SUR",
                                    "ANTIOQUIA NORTE", "CUNDIBOYACENSE", "SANTANDERES", "SINU Y SABANAS", "TOLIMA",
                                    "EJE CAFETERO NORTE", "LLANOS", "CARIBE BOLIVAR", "NORTE", "VALLE CENTRO NORTE",
                                    "EJE CAFETERO SUR", "CAUCA Y NARIÑO", "BUCARAMANGA", "VALLE SUR", "CHAPINERO",
                                    "ZONA CENTRO", "CARIBE ATLANTICO", "METROPOLITANA", "CENTRO", "CALI", "ZONA OCCIDENTE",
                                    "BUCARAMANGA METROPOLITANA", "OCCIDENTE", "NOROCCIDENTE", "ZONA NORTE", "ZONA MEDELLIN",
                                    "CENTRO ORIENTE", "MEDELLIN SUR", "SIERRA NEVADA", "PALMIRA Y SUR", "GESTORIA ANTIOQUIA Y SABANAS",
                                    "GESTORIA BOGOTA Y CENTRO", "ZONA ORIENTE", "EJE CAFETERO", "MOBILIARIO BOGOTA", "BOGOTA",
                                    "CARIBE", "PALMIRA", "ZONA ANTIOQUIA", "NARIÑO", "VALLE NORTE Y QUINDIO", "BOGOTA Y CENTRO",
                                    "VALLE SUR Y CAUCA", "BOGOTÁ Y CENTRO", "ZONA SUPERVISOR", "TROPAS ANTIOQUIA Y SABANAS",
                                    "TROPAS BOGOTA Y CENTRO", "TROPAS SUR", "TROPAS EJE CAFETERO"
                                ]} 
                                onChange={handleChange} 
                            />

                            <CustomDropdown 
                                label="Ciudad" 
                                name="ciudad" 
                                value={formData.ciudad} 
                                options={[
                                    "BOGOTA", "PALMIRA", "ALBANIA", "BETULIA", "BILBAO", "BRICEÑO", "BUENAVISTA", "BOLIVAR", "CAREPA", "CHICORAL", "PALESTINA", "DIBULLA", "EL CALVARIO", "CHAPARRAL", "EL PASO", "EL PLAYON", "RETEN", "SOLEDAD", "GUACHETA", "HATONUEVO", "LA APARTADA", "LA ESPERANZA", "LA VICTORIA", "MAHATES", "MANZANARES", "PACHAVITA", "PITALITO", "PONEDERA", "PUENTE NACIONAL", "PUERTO TRIUNFO", "QUINCHIA", "SALGAR", "SAN ADOLFO", "SAN JOSE DE URE", "SAN MIGUEL DE SEMA", "SANTA BARBARA", "SANTA ROSA", "SANTIAGO", "SUAITA SANTANDER", "TURBACO", "VALLE DE SAN JOSE", "YOLOMBO", "CALI", "BELLO", "BARRANCABERMEJA", "BELEN DE UMBRIA", "SINCELEJO", "SOACHA", "BARRANQUILLA", "ARAUCA", "CASTILLA LA NUEVA", "BUCARAMANGA", "BUENAVENTURA", "ARBELAEZ", "UPIA", "CESAR", "IPIALES", "JAMUNDI", "RIOSUCIO", "YOPAL", "YUMBO", "CUCUTA", "LOS PATIOS", "NATAGAIMA", "PUERTO RICO", "YONDO", "SAN ANDRES", "VILLAVICENCIO", "TUNJA", "ANTIOQUIA", "NEIVA", "PASTO", "SANTA MARTA", "TIBASOSA", "MONTELIBANO", "RIOHACHA", "MALAMBO", "GIRON", "MADRID", "APARTADO", "MEDELLIN", "ARMENIA", "CAUCASIA", "CURUMANI", "FONSECA", "FLORIDABLANCA", "GIRARDOT", "HONDA", "IBAGUE", "MAGANGUE", "POPAYAN", "SAN GIL", "TOCANCIPA", "CARTAGENA", "CHIQUINQUIRA", "ENVIGADO", "PEREIRA", "SABANETA", "CIENAGA", "LIBANO", "SALADOBLANCO", "SALDAÑA", "SAN JUAN DE URABA", "RIONEGRO", "LA CEJA", "ITAGUI", "DUITAMA", "BARBOSA", "PRADERA", "CAÑASGORDAS", "CIUDAD BOLIVAR", "MANIZALES", "QUIMABAYA", "MUTATA", "NECOCLI", "OLAYA", "TUCHIN", "ARBOLETES", "MAGANGUÉ", "SAN VICENTE DEL CAGUÁN", "LA UNION", "MANUARE", "MONTENEGRO", "VILLAMARIA", "FLORENCIA", "MONTERIA", "VALLEDUPAR", "CAJICA", "AGUACHICA", "ANSERMA", "AYAPEL", "BUGA", "CARTAGO", "CERRITO", "CHIA", "CHINCHINA", "CHOCONTA", "COPACABANA", "COTA", "EL PEÑOL", "FLORIDA BLANCA", "GIGANTE", "GINEBRA", "GRANADA", "GUACARI", "LA DORADA", "LA PLATA", "LA VIRGINIA", "LETICIA", "MARINILLA", "MOCOA", "PIEDECUESTA", "PUERTO BERRIO", "PUERTO BOYACA", "INIRIDA", "ROLDANILLO", "SAN ALBERTO", "SAN JOSE DEL GUAVIARE", "SAN PEDRO", "SANTA ROSA DE CABAL", "EL SANTUARIO", "SEVILLA", "SIBATE", "TRUJILLO", "TULUA", "ZARZAL", "BOSCONIA", "BUENAVISTA DEL SINU", "ESPINAL", "FACATATIVA", "MOMPOX", "MONIQUIRA", "PUERTO ASIS", "RAMIRIQUI", "SAN AGUSTIN", "SANTAFE DE ANTIOQUIA", "UBATE", "UBIRBIA", "VALLE DEL GUAMUEZ", "ACACIAS", "AMBALEMA", "BUGALAGRANDE", "CANDELARIA", "CHARALA", "FUNDACION", "GACHANCIPÁ", "GIRARDOTA", "JERICO", "MAICAO", "OCAÑA", "PUERTO COLOMBIA", "PUERTO GAITAN", "PUERTO NARE", "RETIRO", "SABANAGRANDE", "SAN JERONIMO", "SAN VICENTE DEL CAGUAN", "SOGAMOSO", "SOPETRAN", "TUMACO", "YAGUARA", "SAN JUAN DE RIOSECO", "DOSQUEBRADAS", "EL BANCO", "MANAURE", "ZIPAQUIRA", "MITU", "OROCUE", "PLATO", "PUERTO CARREÑO", "RESTREPO", "SALAMINA", "SAN JUAN DEL CESAR", "SANTA FE DE ANTIOQUIA", "URIBIA", "AIPE", "ALGECIRAS", "APIA", "ATACO", "CALIMA", "CÁQUEZA", "CELIA", "CERETE", "CHIGORODO", "CIRCASIA", "COYAIMA", "CUASPUD", "DABEIBA", "FLANDES", "FRESNO", "GARZON", "GUADUAS", "GUAMO", "ISNOS", "NAZARETH", "PALERMO", "PITAL", "PROCIDENCIA", "PUBLO RICO", "PUERTO LOPEZ", "RIOBLANCO", "RIVERA", "ROVIRA", "SALDOBLANCO", "SAN ANTONIO", "URABA", "SAN LUI", "SANTANDER DE QUILICHAO", "TIMANA", "TUQUERRES", "TURBO", "VENADILLO", "VILLAVIEJA", "QUIBDO"
                                ]} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    {/* Sección 3: Estructura Organizativa */}
                    <div className="form-section">
                        <div className="form-section-title">Estructura Organizativa</div>
                        <div className="form-grid">
                            <CustomDropdown 
                                label="Unidad Negocio" 
                                name="unidad_negocio" 
                                value={formData.unidad_negocio} 
                                options={["ESPECIALIZADO", "U. TRANSACCIONAL", "CSC", "APRENDIZ", "MI ATM"]} 
                                onChange={handleChange} 
                            />

                            <CustomDropdown 
                                label="Cliente" 
                                name="cliente" 
                                value={formData.cliente} 
                                options={[
                                    "REVAL", "FUERZA DE VENTA EN CAMPO", "LUKA", "RED", "MULTIPAGAS", "BANCO AGRARIO",
                                    "BANCO DE BOGOTA INHOUSE", "BANCO DE BOGOTA", "GESTORIA", "BBVA", "BANCO CAJA SOCIAL",
                                    "BANCO DEL OCCIDENTE", "BANCO POPULAR", "CITIBANK", "COOPCENTRAL", "DAVIVIENDA",
                                    "FINCOMERCIO", "GESTORIA DE RED", "BANCO ITAU", "JARDIN BOTANICO", "CB MOVIL",
                                    "BANCOLOMBIA", "MULTIPRODUCTO", "DAVIPLATA", "AV VILLAS", "SCARE"
                                ]} 
                                onChange={handleChange} 
                            />

                            <CustomDropdown 
                                label="Empresa" 
                                name="empresa" 
                                value={formData.empresa} 
                                options={["REVAL", "MULTIPAGAS", "MULTIVAL"]} 
                                onChange={handleChange} 
                            />

                            <div className="form-group">
                                <label>Cód. PTR</label>
                                <input type="text" name="cod_ptr" className="planta-input" value={formData.cod_ptr} onChange={handleChange} placeholder="Código PTR" />
                            </div>

                            <div className="form-group">
                                <label>CC Helisa</label>
                                <input type="text" name="cc_helisa" className="planta-input" value={formData.cc_helisa} onChange={handleChange} placeholder="Centro de Costos Helisa" />
                            </div>

                            <CustomDropdown 
                                label="Oficina" 
                                name="oficina" 
                                value={formData.oficina} 
                                options={[
                                    "ADMIN ESPECIALIZADA", "ADMIN FUERZA VENTAS", "Admin Gestoria", "ADMIN LUKA", "ADMIN LUKA EXITO",
                                    "ADMIN RED DE OFICINAS", "ADMINISTRACION", "ADMON TALENTO HUMANO", "BAGR - Albania", "BAGR - Betulia",
                                    "BAGR - Bilbao", "BAGR - Bosa", "BAGR - Briceño", "BAGR - BuenaVista", "BAGR - Cantagallo",
                                    "BAGR - Carepa", "BAGR - Chicoral", "BAGR - Corregimiento Arauca", "BAGR - Dibulla", "BAGR - El Calvario",
                                    "BAGR - El Limon", "BAGR - El Paso Cesar", "BAGR - El Playon", "BAGR - El Reten",
                                    "BAGR - Granabastos Soledad", "BAGR - Guacheta", "BAGR - Hatonuevo", "BAGR - La Apartada",
                                    "BAGR - La Esperanza", "BAGR - La Victoria", "BAGR - Mahates", "BAGR - Manzanares", "BAGR - Pachavita",
                                    "BAGR - Pitalito III", "BAGR - Ponedera", "BAGR - Puente Nacional", "BAGR - Puerto Triunfo",
                                    "BAGR - Quinchia", "BAGR - Salgar", "BAGR - San Adolfo", "BAGR - San Jose de Ure",
                                    "BAGR - San Miguel de Sema", "BAGR - Santa Barbara", "BAGR - Santa Rosa",
                                    "BAGR - Santiago Norte Santander", "BAGR - Santiago Putumayo", "BAGR - Suaita", "BAGR - Turbaco",
                                    "BAGR - Valle De San Jose", "BAGR - Yolombo", "BAGR - Zambrano", "BBOI - Av. Chile", "BBOI - Bosa Centro",
                                    "BBOI - Calle 13 Bogota", "BBOI - Calle 80", "BBOI - Chinu", "BBOI - Codazzi", "BBOI - El Banco",
                                    "BBOI - El Retiro", "BBOI - Espinal", "BBOI - Facatativa", "BBOI - Fontibon", "BBOI - Fundacion",
                                    "BBOI - Granada", "BBOI - Honda", "BBOI - Kennedy", "BBOI - La Ceja", "BBOI - La Dorada",
                                    "BBOI - La Mesa", "BBOI - Madrid", "BBOI - Magangue", "BBOI - Mariquita", "BBOI - Mompos",
                                    "BBOI - Moniquira", "BBOI - Pitalito", "BBOI - Plato", "BBOI - Puerto Asis", "BBOI - Puerto Boyaca",
                                    "BBOI - Puerto Carreño", "BBOI - Puerto Lopez", "BBOI - Ramiriqui", "BBOI - Rionegro",
                                    "BBOI - San Agustin", "BBOI - Santafe De Antioquia", "BBOI - Santander De Quilichao", "BBOI - Saravena",
                                    "BBOI - Sevilla", "BBOI - Sibate", "BBOI - Ubate", "BBOI - Uribia", "BBOI - Valle Del Guamuez",
                                    "BBOI - Villeta", "BBOI - Zipaquira", "BBOI - Zona Industrial", "BOG- ADMIN CARTERA",
                                    "BOG- COMERCIAL ADMON", "BOG- COMERCIAL LUKA", "BOG- COMERCIAL RED", "BOG- COORDINADOR CALI",
                                    "BOG- COORDINADOR REGIONAL", "BOG- COORDINADORA LUKA", "BOG- CORRESPONSALIA", "BOG- CSC",
                                    "BOG- DIRECTOR COMERCIAL", "BOG- DIR-REVAL", "BOG- FORMADOR NACIONAL", "BOG- GERENTE COMERCIAL",
                                    "BOG- GERENTE CORPORATIVO", "BOG- GESTOR DE RED", "BOG- GESTOR TECNOLÓGICO", "BOG- LIDER COMERCIAL",
                                    "BOG- LIDER DE EXCELENCIA", "BOG- LIDER GESTION NEGOCIO", "BOG- MI ATM", "BOG- OPERATIVO CSC",
                                    "BOG- SUPERVISOR CGM", "BOG- SUPERVISOR LUKA", "BOG- SUPERVISOR RED", "BOG- TALENTO HUMANO", "BOG- TECO",
                                    "CALI- GESTOR DE RED", "CALI- OPERATIVO BACK", "CSC - CAJERO SUPERNUMERARIO",
                                    "CSC - CENTRO SERVICIOS COMPARTIDOS", "DESCANSO CALI", "DESCANSO MEDELLIN", "DESCANSO-BOGOTA",
                                    "EJE - GESTOR DE RED", "GESTORIA", "GESTORIA ANTIOQUIA", "GESTORIA BOGOTA", "GESTORIA CALI",
                                    "LUKA EXITO - ALAMEDA", "LUKA EXITO - ANTIOQUIA", "LUKA EXITO - BARRANQUILLA", "LUKA EXITO - BELLO",
                                    "LUKA EXITO - BUCARAMANGA", "LUKA EXITO - CARTAGENA", "LUKA EXITO - CASTELLANA",
                                    "LUKA EXITO - COLINA CAMPESTRE", "LUKA EXITO - ENVIGADO", "LUKA EXITO - FLORA", "LUKA EXITO - FONTIBON",
                                    "LUKA EXITO - IBAGUE", "LUKA EXITO - ITAGUI", "LUKA EXITO - MANIZALES", "LUKA EXITO - MONTERIA",
                                    "LUKA EXITO - NEIVA", "LUKA EXITO - NIQUIA", "LUKA EXITO - PASTO", "LUKA EXITO - PEREIRA",
                                    "LUKA EXITO - POPAYAN", "LUKA EXITO - RIONEGRO", "LUKA EXITO - ROBLEDO", "LUKA EXITO - SAN FERNANDO",
                                    "LUKA EXITO - SAN MATEO", "LUKA EXITO - SANTA MARTA", "LUKA EXITO - SUBA", "LUKA EXITO - TULUA",
                                    "LUKA EXITO - VALLEDUPAR", "LUKA EXITO - VILLAVICENCIO", "LUKA EXITO - WOW UNICENTRO",
                                    "LUKA MOVIL - CALI", "LUKA MOVIL - MEDELLIN", "LUKA MOVIL - VILLAVICENCIO", "LUKA MOVIL- BOGOTA",
                                    "MED- GESTOR DE RED", "MOBILIARIO", "MULTIPAGAS - 7 DE AGOSTO", "MULTIPAGAS - ALAMOS",
                                    "MULTIPAGAS - ALQUERIA", "MULTIPAGAS - AV. CHILE", "MULTIPAGAS - BOSA", "MULTIPAGAS - CALLE 100",
                                    "MULTIPAGAS - CALLE 13", "MULTIPAGAS - CALLE 140", "MULTIPAGAS - CALLE 17", "MULTIPAGAS - CALLE 183",
                                    "MULTIPAGAS - CALLE 53", "MULTIPAGAS - CALLE 63", "MULTIPAGAS - CALLE 72", "MULTIPAGAS - CALLE 80",
                                    "MULTIPAGAS - CASTELLANA", "MULTIPAGAS - CEDRITOS", "MULTIPAGAS - CENTRO MAYOR",
                                    "MULTIPAGAS - CHAPINERO", "MULTIPAGAS - CHICO", "MULTIPAGAS - CIUDAD JARDIN", "MULTIPAGAS - COLINA",
                                    "MULTIPAGAS - COMERCIAL", "MULTIPAGAS - CORFERIAS", "MULTIPAGAS - CUARTA AVENIDA",
                                    "MULTIPAGAS - EL LAGO", "MULTIPAGAS - ESTRADA", "MULTIPAGAS - FACATATIVA", "MULTIPAGAS - FONTIBON",
                                    "MULTIPAGAS - GALERIAS", "MULTIPAGAS - GRAN ESTACION", "MULTIPAGAS - HAYUELOS", "MULTIPAGAS - KENNEDY",
                                    "MULTIPAGAS - LA FELICIDAD", "MULTIPAGAS - LAS NIEVES", "MULTIPAGAS - MADRID", "MULTIPAGAS - MAZUREN",
                                    "MULTIPAGAS - METROPOLIS", "MULTIPAGAS - MODELIA", "MULTIPAGAS - MONSERRATE", "MULTIPAGAS - NIZA",
                                    "MULTIPAGAS - OLAYA", "MULTIPAGAS - OUTLET FLORESTA", "MULTIPAGAS - PALATINO", "MULTIPAGAS - PALOQUEMAO",
                                    "MULTIPAGAS - PARQUE LA COLINA", "MULTIPAGAS - PASADENA", "MULTIPAGAS - PEPE SIERRA",
                                    "MULTIPAGAS - PESTANA", "MULTIPAGAS - PLAZA CENTRAL", "MULTIPAGAS - PLAZA DE LAS AMERICAS",
                                    "MULTIPAGAS - PORTAL 80", "MULTIPAGAS - PRADO", "MULTIPAGAS - RESTREPO", "MULTIPAGAS - SALITRE PLAZA",
                                    "MULTIPAGAS - SAN CIPRIANO", "MULTIPAGAS - SAN FACON", "MULTIPAGAS - SAN MARTIN",
                                    "MULTIPAGAS - SANTA ANA", "MULTIPAGAS - SANTA BARBARA", "MULTIPAGAS - SANTA HELENITA",
                                    "MULTIPAGAS - SANTA ISABEL", "MULTIPAGAS - SANTAFE", "MULTIPAGAS - SOACHA", "MULTIPAGAS - SUBA",
                                    "MULTIPAGAS - TELEPORT", "MULTIPAGAS - TITAN PLAZA", "MULTIPAGAS - TOBERIN", "MULTIPAGAS - UNICENTRO",
                                    "MULTIPAGAS - VENECIA", "MULTIPAGAS - VILLA DEL RIO", "MULTIPAGAS - ZIPAQUIRA", "NOR- GESTOR DE RED",
                                    "OFICINA PRINCIPAL", "RED - ALTO RIESGO", "RED - ARCHIVO", "RED - AUDITORIA", "RED - BAGR GESTORES",
                                    "RED - BBOI GESTORES", "RED - BPO", "RED - CONTABILIDAD", "RED - CONTROL INTERNO", "RED - FINANCIERO",
                                    "RED - GESTION HUMANA", "RED - INNOVACION", "RED - JURIDICO", "RED - MERCADEO", "RED - MESA DE CONTROL",
                                    "RED - MONITOREO", "RED - NOMINA", "RED - NUEVOS PROYECTOS", "RED - OPERACIONES",
                                    "RED - PREVENCION RIESGO", "RED - RECURSOS FISICOS", "RED - SELECCION", "RED - SST", "RED - TECNOLOGIA",
                                    "REVAL - 20 DE JULIO", "REVAL - 7 DE AGOSTO", "REVAL - ALBANIA", "REVAL - ALCALA", "REVAL - ALQUERIA",
                                    "REVAL - ANTIOQUIA", "REVAL - APARTADO", "REVAL - ARBOLETES", "REVAL - ARMENIA", "REVAL - AV. CHILE",
                                    "REVAL - BAGR GESTORES", "REVAL - BARBOSA", "REVAL - BARRANCABERMEJA", "REVAL - BARRANQUILLA",
                                    "REVAL - BBOI GESTORES", "REVAL - BELLO", "REVAL - BOGOTA", "REVAL - BOSA", "REVAL - BUCARAMANGA",
                                    "REVAL - BUENAVENTURA", "REVAL - BUGA", "REVAL - CAJICA", "REVAL - CALI", "REVAL - CALLE 100",
                                    "REVAL - CALLE 13", "REVAL - CALLE 140", "REVAL - CALLE 17", "REVAL - CALLE 53", "REVAL - CALLE 63",
                                    "REVAL - CALLE 72", "REVAL - CALLE 80", "REVAL - CALLE 92", "REVAL - CAREPA", "REVAL - CARTAGENA",
                                    "REVAL - CARTAGO", "REVAL - CASTELLANA", "REVAL - CAUCASIA", "REVAL - CEDRITOS", "REVAL - CENTRO MAYOR",
                                    "REVAL - CERETE", "REVAL - CHAPINERO", "REVAL - CHIA", "REVAL - CHICO", "REVAL - CHIGORODO",
                                    "REVAL - CHIQUINQUIRA", "REVAL - CIENAGA", "REVAL - CIUDAD JARDIN", "REVAL - COLINA", "REVAL - CONECTA",
                                    "REVAL - COORDINACION", "REVAL - CORFERIAS", "REVAL - COTA", "REVAL - CUCUTA", "REVAL - CURUMANI",
                                    "REVAL - DABEIBA", "REVAL - DOSQUEBRADAS", "REVAL - DUITAMA", "REVAL - EJE CAFETERO", "REVAL - EL BANCO",
                                    "REVAL - EL LAGO", "REVAL - ENVIGADO", "REVAL - FACATATIVA", "REVAL - FLORENCIA", "REVAL - FLORIDABLANCA",
                                    "REVAL - FONTIBON", "REVAL - FUNDACION", "REVAL - GALERIAS", "REVAL - GIRARDOT", "REVAL - GIRON",
                                    "REVAL - GRAN ESTACION", "REVAL - GRANADA", "REVAL - HAYUELOS", "REVAL - IBAGUE", "REVAL - IPIALES",
                                    "REVAL - ITAGUI", "REVAL - JAMUNDI", "REVAL - JARDIN BOTANICO", "REVAL - KENNEDY", "REVAL - LA CEJA",
                                    "REVAL - LA DORADA", "REVAL - LA FELICIDAD", "REVAL - LAS NIEVES", "REVAL - LETICIA", "REVAL - LLANOS",
                                    "REVAL - MADRID", "REVAL - MAGANGUE", "REVAL - MAICAO", "REVAL - MANIZALES", "REVAL - MARINILLA",
                                    "REVAL - MAZUREN", "REVAL - MEDELLIN", "REVAL - METROPOLIS", "REVAL - MITU", "REVAL - MOCOA",
                                    "REVAL - MODELIA", "REVAL - MONSERRATE", "REVAL - MONTELIBANO", "REVAL - MONTERIA", "REVAL - MUTATA",
                                    "REVAL - NEIVA", "REVAL - NIZA", "REVAL - OCAÑA", "REVAL - OLAYA", "REVAL - OUTLET FLORESTA",
                                    "REVAL - PALATINO", "REVAL - PALMIRA", "REVAL - PALOQUEMAO", "REVAL - PARQUE LA COLINA",
                                    "REVAL - PASADENA", "REVAL - PASTO", "REVAL - PEPE SIERRA", "REVAL - PEREIRA", "REVAL - PESTANA",
                                    "REVAL - PIEDECUESTA", "REVAL - PITALITO", "REVAL - PLATO", "REVAL - PLAZA CENTRAL",
                                    "REVAL - PLAZA DE LAS AMERICAS", "REVAL - POPAYAN", "REVAL - PORTAL 80", "REVAL - PRADO",
                                    "REVAL - PUERTO ASIS", "REVAL - PUERTO BERRIO", "REVAL - PUERTO CARREÑO", "REVAL - QUIBDO",
                                    "REVAL - RESTREPO", "REVAL - RIOHACHA", "REVAL - RIONEGRO", "REVAL - SABANETA", "REVAL - SALITRE PLAZA",
                                    "REVAL - SAN AGUSTIN", "REVAL - SAN ANDRES", "REVAL - SAN CIPRIANO", "REVAL - SAN FACON",
                                    "REVAL - SAN GIL", "REVAL - SAN JOSE DEL GUAVIARE", "REVAL - SAN JUAN DEL CESAR", "REVAL - SAN MARTIN",
                                    "REVAL - SANTA ANA", "REVAL - SANTA BARBARA", "REVAL - SANTA HELENITA", "REVAL - SANTA ISABEL",
                                    "REVAL - SANTA MARTA", "REVAL - SANTA ROSA DE CABAL", "REVAL - SANTAFE",
                                    "REVAL - SANTANDER DE QUILICHAO", "REVAL - SINCELEJO", "REVAL - SOACHA", "REVAL - SOGAMOSO",
                                    "REVAL - SUBA", "REVAL - TELEPORT", "REVAL - TITAN PLAZA", "REVAL - TOBERIN", "REVAL - TULUA",
                                    "REVAL - TUMACO", "REVAL - TUNJA", "REVAL - TURBO", "REVAL - UBATE", "REVAL - UNICENTRO",
                                    "REVAL - VALLEDUPAR", "REVAL - VENECIA", "REVAL - VILLA DEL RIO", "REVAL - VILLAVICENCIO",
                                    "REVAL - YOPAL", "REVAL - YUMBO", "REVAL - ZIPAQUIRA", "REVAL - ZONA INDUSTRIAL", "SCARE",
                                    "SCARE - BARRANQUILLA", "SCARE - BOGOTA", "SCARE - BUCARAMANGA", "SCARE - CALI", "SCARE - MEDELLIN",
                                    "SCARE - NEIVA", "SCARE - PASTO", "SCARE - PEREIRA", "SUR- GESTOR DE RED", "TROPAS"
                                ]} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    {/* Sección 4: Gestión de Planta */}
                    <div className="form-section">
                        <div className="form-section-title">Gestión de Planta</div>
                        <div className="form-grid">
                            <CustomDropdown 
                                label="Vacante/Sob." 
                                name="vacante_sob" 
                                value={formData.vacante_sob} 
                                options={[
                                    "OP", "AP", "NI", "CP", "VA", "TP", "SP", "TD", "SO", "TPS", "CD", "ADM", "VADM", "VAOP", "VAP", "VD"
                                ]} 
                                onChange={handleChange} 
                            />

                            <div className="form-group">
                                <label>Supervisor/Gerente</label>
                                <input type="text" name="supervisor_gerente" className="planta-input" value={formData.supervisor_gerente} onChange={handleChange} placeholder="Nombre del supervisor" />
                            </div>

                            <div className="form-group">
                                <label>Jornada</label>
                                <input type="text" name="jornada" className="planta-input" value={formData.jornada} onChange={handleChange} placeholder="Ej: L-V 8am-5pm" />
                            </div>

                            <div className="form-group">
                                <label>Correo Personal</label>
                                <input type="email" name="correo" className="planta-input" value={formData.correo} onChange={handleChange} required placeholder="correo@personal.com" />
                            </div>

                            <div className="form-group">
                                <label>¿Requiere Correo Corp.?</label>
                                <div className="requires-email-toggle">
                                    <button 
                                        type="button" 
                                        className={`toggle-btn btn-no ${formData.requiere_correo === 'no' ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, requiere_correo: 'no' }))}
                                    >
                                        ❌ NO
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`toggle-btn btn-yes ${formData.requiere_correo === 'si' ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, requiere_correo: 'si' }))}
                                    >
                                        ✅ SÍ
                                    </button>
                                </div>
                            </div>

                            {formData.requiere_correo === 'si' && (
                                <>
                                    <CustomDropdown 
                                        label="Dominio de Correo" 
                                        name="dominio_correo" 
                                        value={formData.dominio_correo} 
                                        options={["@reval.com.co", "@multipagas.com", "@multival.com.co"]} 
                                        onChange={handleChange} 
                                    />
                                    <div className="form-group correo-corp-group">
                                        <label>Correo Corporativo Generado</label>
                                        <input 
                                            type="email" 
                                            name="correo_corp" 
                                            className="planta-input corporate-email-input" 
                                            value={formData.correo_corp} 
                                            onChange={handleChange} 
                                            placeholder="Se generará automáticamente..."
                                            style={{ borderColor: '#FFCD04', boxShadow: '0 0 15px rgba(255, 205, 4, 0.1)' }}
                                        />
                                        <span className="info-text">Se creará en el directorio de correos (Puerto 8003)</span>
                                    </div>
                                </>
                            )}

                            <CustomDropdown 
                                label="Estado" 
                                name="estado" 
                                value={formData.estado} 
                                options={[
                                    "FUERO MEDICO", "PROCESO CAMBIO DE CONTRATO", "MADRES GESTANTES", "LICENCIA DE MATERNIDAD",
                                    "COMPENSADOR", "FUERO MEDICO,COMPENSADOR", "COMPENSADOR,MADRES GESTANTES", "CEDIDO AL SENA",
                                    "CEDIDO AL SENA,DISCAPACIDAD", "FUERO PENSION"
                                ]} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    {/* Sección 5: Status y Novedades */}
                    <div className="form-section">
                        <div className="form-section-title">Status y Novedades</div>
                        <div className="form-grid">
                            <CustomDropdown 
                                label="Status" 
                                name="status" 
                                value={formData.status} 
                                options={[
                                    "ACTIVO", "ACTIVO SENA", "INCAPACIDAD", "VACANTE", "VACACIONES", "LICENCIA DE MATERNIDAD",
                                    "LICENCIA NO REMUNERADA", "LICENCIA POR LUTO", "ACTIVO DIAS", "DIA DE LA FAMILIA",
                                    "AUSENCIA INJUSTIFICADA", "CALAMIDAD", "MEDICO", "HOSPITALIZADO", "SANCION",
                                    "LICENCIA DE PATERNIDAD", "LICENCIA REMUNERADA", "PERMISO"
                                ]} 
                                onChange={handleChange} 
                            />

                            <div className="form-group">
                                <label>Novedad</label>
                                <input type="text" name="novedad" className="planta-input" value={formData.novedad} onChange={handleChange} placeholder="Tipo de novedad" />
                            </div>

                            <div className="form-group">
                                <label>Fecha Inicial (Novedad)</label>
                                <input type="date" name="fecha_inicial" className="planta-input" value={formData.fecha_inicial} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Fecha Final (Novedad)</label>
                                <input type="date" name="fecha_final" className="planta-input" value={formData.fecha_final} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Días Ausencia</label>
                                <input type="number" name="dias_ausencia" className="planta-input" value={formData.dias_ausencia} onChange={handleChange} placeholder="0" />
                            </div>
                        </div>
                    </div>

                    {/* Sección 6: Retiro y Traslados */}
                    <div className="form-section">
                        <div className="form-section-title">Retiro y Traslados</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Fecha Retiro</label>
                                <input type="date" name="fecha_retiro" className="planta-input" value={formData.fecha_retiro} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Motivo Retiro</label>
                                <input type="text" name="motivo_retiro" className="planta-input" value={formData.motivo_retiro} onChange={handleChange} placeholder="Causa del retiro" />
                            </div>

                            <div className="form-group">
                                <label>Destino Traslado</label>
                                <input type="text" name="destino_traslado" className="planta-input" value={formData.destino_traslado} onChange={handleChange} placeholder="Nueva ubicación" />
                            </div>

                            <div className="form-group full-width">
                                <label>Observación</label>
                                <textarea name="observacion" className="planta-input" value={formData.observacion} onChange={handleChange} rows="3" placeholder="Observaciones adicionales..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Sección 7: Información Bancaria */}
                    <div className="form-section">
                        <div className="form-section-title">Información Bancaria</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Banco</label>
                                <input type="text" name="banco" className="planta-input" value={formData.banco} onChange={handleChange} placeholder="Nombre del banco" />
                            </div>

                            <div className="form-group">
                                <label>Cuenta</label>
                                <input type="text" name="cuenta" className="planta-input" value={formData.cuenta} onChange={handleChange} placeholder="Número de cuenta" />
                            </div>

                            <CustomDropdown 
                                label="Tipo Cuenta" 
                                name="tipo_cuenta" 
                                value={formData.tipo_cuenta} 
                                options={["AHORROS", "CORRIENTE"]} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Procesando Registro...' : 'Registrar Colaborador en Planta'}
                    </button>
                </form>
            </div>

            {/* Premium Credentials Modal */}
            {showCredentialsModal && createdCredentials && (
                <div className="modal-backdrop" onClick={() => setShowCredentialsModal(false)}>
                    <div className="credentials-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="credentials-modal-header">
                            <h2>✅ Colaborador Registrado</h2>
                            <p>Se crearon exitosamente las siguientes cuentas para el colaborador.</p>
                        </div>

                        <div className="credentials-cards-container">
                            {/* Card 1: Directorio Activo */}
                            <div
                                className={`credential-card ad ${createdCredentials.ad?.success ? 'selected' : ''}`}
                                style={{ opacity: createdCredentials.ad?.success ? 1 : 0.6, cursor: 'default' }}
                            >
                                <div className="credential-info">
                                    <div className="credential-title-row">
                                        <span className="credential-badge">💻 Directorio Activo</span>
                                        {!createdCredentials.ad?.success && <span className="credential-failed-badge">No disponible</span>}
                                    </div>
                                    {createdCredentials.ad?.success ? (
                                        <div className="credential-field">
                                            <span>Usuario:</span>
                                            <span className="credential-value">{createdCredentials.ad.username}</span>
                                            <button
                                                type="button"
                                                className={`btn-copy-small ${copiedField === 'ad_user' ? 'copied' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); handleCopy(createdCredentials.ad.username, 'ad_user'); }}
                                            >
                                                {copiedField === 'ad_user' ? '✓ Copiado' : 'Copiar'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#94a3b8' }}>No se pudo aprovisionar la cuenta en el Directorio Activo.</p>
                                    )}
                                </div>
                            </div>

                            {/* Card 2: Correo Corporativo */}
                            <div
                                className={`credential-card email ${createdCredentials.email?.success ? 'selected' : ''}`}
                                style={{ opacity: createdCredentials.email?.success ? 1 : 0.6, cursor: 'default' }}
                            >
                                <div className="credential-info">
                                    <div className="credential-title-row">
                                        <span className="credential-badge">📧 Correo Corporativo</span>
                                        {!createdCredentials.email?.success && <span className="credential-failed-badge">No disponible</span>}
                                    </div>
                                    {createdCredentials.email?.success ? (
                                        <div className="credential-field">
                                            <span>Correo:</span>
                                            <span className="credential-value">{createdCredentials.email.email}</span>
                                            <button
                                                type="button"
                                                className={`btn-copy-small ${copiedField === 'email_user' ? 'copied' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); handleCopy(createdCredentials.email.email, 'email_user'); }}
                                            >
                                                {copiedField === 'email_user' ? '✓ Copiado' : 'Copiar'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#94a3b8' }}>Este colaborador no requería correo corporativo o falló el aprovisionamiento.</p>
                                    )}
                                </div>
                            </div>

                            {/* Card 3: osTicket */}
                            <div
                                className={`credential-card osticket ${createdCredentials.osticket?.success ? 'selected' : ''}`}
                                style={{ opacity: createdCredentials.osticket?.success ? 1 : 0.6, cursor: 'default' }}
                            >
                                <div className="credential-info">
                                    <div className="credential-title-row">
                                        <span className="credential-badge">🎫 Portal osTicket / SAHG</span>
                                        {!createdCredentials.osticket?.success && <span className="credential-failed-badge">No disponible</span>}
                                    </div>
                                    {createdCredentials.osticket?.success ? (
                                        <div className="credential-field">
                                            <span>Correo:</span>
                                            <span className="credential-value">{createdCredentials.osticket.email}</span>
                                            <button
                                                type="button"
                                                className={`btn-copy-small ${copiedField === 'ost_user' ? 'copied' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); handleCopy(createdCredentials.osticket.email, 'ost_user'); }}
                                            >
                                                {copiedField === 'ost_user' ? '✓ Copiado' : 'Copiar'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#94a3b8' }}>No se pudo aprovisionar la cuenta en el portal de soporte osTicket.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Aviso de envío automático por seguridad */}
                        <div className="auto-send-notice">
                            <span className="notice-icon">🔒</span>
                            <div className="notice-text">
                                <strong>Credenciales enviadas automáticamente</strong>
                                Por directriz de Riesgo y Seguridad, las contraseñas temporales han sido enviadas de forma automática al correo personal registrado del colaborador y NO se almacenan en el sistema.
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setShowCredentialsModal(false)}
                            >
                                Cerrar y finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreacionUsuarioPlanta;
