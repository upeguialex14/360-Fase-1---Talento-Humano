import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './SolicitudVacantes.css';

// Opciones predefinidas para los campos del formulario
const OFICINAS = [
    { value: '', label: 'Seleccionar Oficina' },
    { value: 'bogota_norte', label: 'Bogotá Norte' },
    { value: 'bogota_sur', label: 'Bogotá Sur' },
    { value: 'bogota_centro', label: 'Bogotá Centro' },
    { value: 'medellin', label: 'Medellín' },
    { value: 'cali', label: 'Cali' },
    { value: 'barranquilla', label: 'Barranquilla' },
    { value: 'cartagena', label: 'Cartagena' },
    { value: 'bucaramanga', label: 'Bucaramanga' },
    { value: 'pereira', label: 'Pereira' },
    { value: 'ibague', label: 'Ibagué' },
    { value: 'neiva', label: 'Neiva' },
    { value: 'santa_marta', label: 'Santa Marta' },
];

const CIUDADES = [
    { value: '', label: 'Seleccionar Ciudad' },
    { value: 'bogota', label: 'Bogotá' },
    { value: 'medellin', label: 'Medellín' },
    { value: 'cali', label: 'Cali' },
    { value: 'barranquilla', label: 'Barranquilla' },
    { value: 'cartagena', label: 'Cartagena' },
    { value: 'bucaramanga', label: 'Bucaramanga' },
    { value: 'pereira', label: 'Pereira' },
    { value: 'ibague', label: 'Ibagué' },
    { value: 'neiva', label: 'Neiva' },
    { value: 'santa_marta', label: 'Santa Marta' },
    { value: 'manizales', label: 'Manizales' },
    { value: 'armenia', label: 'Armenia' },
    { value: 'villavicencio', label: 'Villavicencio' },
    { value: 'cucuta', label: 'Cúcuta' },
    { value: 'popayan', label: 'Popayán' },
];

const CARGOS = [
    { value: '', label: 'Seleccionar Cargo' },
    { value: 'analista_contable', label: 'Analista Contable' },
    { value: 'analista_recursos_humanos', label: 'Analista de Recursos Humanos' },
    { value: 'analista_sistemas', label: 'Analista de Sistemas' },
    { value: 'asistente_administrativo', label: 'Asistente Administrativo' },
    { value: 'asistente_contabilidad', label: 'Asistente de Contabilidad' },
    { value: 'asistente_logistica', label: 'Asistente de Logística' },
    { value: 'asistente_comercial', label: 'Asistente Comercial' },
    { value: 'coordinador_operaciones', label: 'Coordinador de Operaciones' },
    { value: 'coordinador_comercial', label: 'Coordinador Comercial' },
    { value: 'director_area', label: 'Director de Área' },
    { value: 'gerente_regional', label: 'Gerente Regional' },
    { value: 'jefe_sucursal', label: 'Jefe de Sucursal' },
    { value: 'supervisor_operaciones', label: 'Supervisor de Operaciones' },
    { value: 'tecnico_sistemas', label: 'Técnico de Sistemas' },
    { value: 'tecnico_mantenimiento', label: 'Técnico de Mantenimiento' },
    { value: 'auxiliar_servicios_generales', label: 'Auxiliar de Servicios Generales' },
    { value: 'conductor', label: 'Conductor' },
    { value: 'otro', label: 'Otro' },
];

const CANTIDAD_RECURSOS = [
    { value: '', label: 'Seleccionar Cantidad' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
];

const JUSTIFICACIONES = [
    { value: '', label: 'Seleccionar Justificación' },
    { value: 'cargo_nuevo', label: 'Cargo Nuevo' },
    { value: 'reemplazo_definitivo', label: 'Reemplazo Definitivo' },
    { value: 'reemplazo_temporal', label: 'Reemplazo Temporal (Licencia, Vacaciones)' },
    { value: 'ampliacion_operacion', label: 'Ampliación de Operación' },
    { value: 'proyecto_especifico', label: 'Proyecto Específico' },
    { value: 'renuncia', label: 'Renuncia' },
    { value: 'retiro', label: 'Retiro' },
    { value: 'otro', label: 'Otro' },
];

// Iconos SVG
const Icons = {
    upload: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    ),
    send: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
    ),
    trash: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
    ),
    info: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    ),
    check: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    file: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
    ),
    x: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    )
};

/**
 * Página de Solicitud de Vacantes
 * Formulario para que los líderes de área soliciten personal
 */
const SolicitudVacantes = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        oficina: '',
        ciudad: '',
        cargo: '',
        cantidad: '',
        justificacion: '',
        detalle: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [files, setFiles] = useState({
        hojaVida: null,
        aprobacion: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error cuando el usuario modifica el campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (máximo 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, [field]: 'El archivo no puede superar 10MB' }));
                return;
            }
            setFiles(prev => ({ ...prev, [field]: file }));
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFileDrop = (e, field) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, [field]: 'El archivo no puede superar 10MB' }));
                return;
            }
            setFiles(prev => ({ ...prev, [field]: file }));
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const removeFile = (field) => {
        setFiles(prev => ({ ...prev, [field]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.oficina) newErrors.oficina = 'La oficina es requerida';
        if (!formData.ciudad) newErrors.ciudad = 'La ciudad es requerida';
        if (!formData.cargo) newErrors.cargo = 'El cargo solicitado es requerido';
        if (!formData.cantidad) newErrors.cantidad = 'La cantidad de recursos es requerida';
        if (!formData.justificacion) newErrors.justificacion = 'La justificación es requerida';
        if (!formData.detalle || formData.detalle.trim().length < 10) {
            newErrors.detalle = 'El detalle debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Enviar datos al backend para crear requisición
            const res = await api.post('/requisiciones', {
                oficina: formData.oficina,
                ciudad: formData.ciudad,
                cargo: formData.cargo,
                cantidad: parseInt(formData.cantidad),
                justificacion: formData.justificacion,
                detalle: formData.detalle,
                empresa: 'MULTIVAL',
                tipo_contrato: null,
                estado: 'Recibido'
            });

            if (res.success) {
                setIsSubmitting(false);
                setShowSuccess(true);
                
                // Limpiar formulario
                handleReset();
                
                // Ocultar mensaje de éxito después de 5 segundos
                setTimeout(() => {
                    setShowSuccess(false);
                }, 5000);
            } else {
                setIsSubmitting(false);
                setErrors({ submit: res.message || 'Error al enviar la solicitud' });
            }
        } catch (err) {
            setIsSubmitting(false);
            console.error('Error enviando solicitud:', err);
            setErrors({ submit: 'Error al enviar la solicitud. Intente nuevamente.' });
        }
    };

    const handleReset = () => {
        setFormData({
            oficina: '',
            ciudad: '',
            cargo: '',
            cantidad: '',
            justificacion: '',
            detalle: ''
        });
        setFiles({
            hojaVida: null,
            aprobacion: null
        });
        setErrors({});
    };

    const getFileName = (file) => {
        if (!file) return '';
        const name = file.name;
        return name.length > 30 ? name.substring(0, 27) + '...' : name;
    };

    return (
        <div className="solicitud-vacantes-container">
            <div className="page-header">
                <h1>Solicitud de Vacantes</h1>
                <p className="page-subtitle">Formulario para solicitar personal adicional</p>
            </div>

            {showSuccess && (
                <div className="success-alert">
                    <span className="success-icon">{Icons.check}</span>
                    <div className="success-content">
                        <strong>Solicitud enviada con éxito</strong>
                        <p>Un analista revisará tu requerimiento; recibirás respuesta en un plazo aproximado de 3 a 5 días hábiles.</p>
                    </div>
                    <button className="success-close" onClick={() => setShowSuccess(false)}>
                        {Icons.x}
                    </button>
                </div>
            )}

            <form className="solicitud-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2 className="section-title">
                        <span className="section-icon">📋</span>
                        Información de la Vacante
                    </h2>
                    
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="oficina">
                                Oficina <span className="required">*</span>
                            </label>
                            <select
                                id="oficina"
                                name="oficina"
                                value={formData.oficina}
                                onChange={handleChange}
                                className={errors.oficina ? 'error' : ''}
                            >
                                {OFICINAS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.oficina && <span className="error-message">{errors.oficina}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="ciudad">
                                Ciudad <span className="required">*</span>
                            </label>
                            <select
                                id="ciudad"
                                name="ciudad"
                                value={formData.ciudad}
                                onChange={handleChange}
                                className={errors.ciudad ? 'error' : ''}
                            >
                                {CIUDADES.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.ciudad && <span className="error-message">{errors.ciudad}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="cargo">
                                Cargo Solicitado <span className="required">*</span>
                            </label>
                            <select
                                id="cargo"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleChange}
                                className={errors.cargo ? 'error' : ''}
                            >
                                {CARGOS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.cargo && <span className="error-message">{errors.cargo}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="cantidad">
                                Cantidad de Recursos <span className="required">*</span>
                            </label>
                            <select
                                id="cantidad"
                                name="cantidad"
                                value={formData.cantidad}
                                onChange={handleChange}
                                className={errors.cantidad ? 'error' : ''}
                            >
                                {CANTIDAD_RECURSOS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="justificacion">
                                Justificación <span className="required">*</span>
                            </label>
                            <select
                                id="justificacion"
                                name="justificacion"
                                value={formData.justificacion}
                                onChange={handleChange}
                                className={errors.justificacion ? 'error' : ''}
                            >
                                {JUSTIFICACIONES.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.justificacion && <span className="error-message">{errors.justificacion}</span>}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="detalle">
                            Detalle Libre <span className="required">*</span>
                        </label>
                        <textarea
                            id="detalle"
                            name="detalle"
                            value={formData.detalle}
                            onChange={handleChange}
                            placeholder="Describe el perfil requerido, experiencia, competencias específicas, funciones del cargo, etc."
                            rows={5}
                            className={errors.detalle ? 'error' : ''}
                        />
                        {errors.detalle && <span className="error-message">{errors.detalle}</span>}
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="section-title">
                        <span className="section-icon">📎</span>
                        Adjuntos (Opcionales)
                    </h2>
                    
                    <div className="file-uploads-grid">
                        <div 
                            className={`file-drop-zone ${files.hojaVida ? 'has-file' : ''} ${errors.hojaVida ? 'error' : ''}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleFileDrop(e, 'hojaVida')}
                        >
                            {files.hojaVida ? (
                                <div className="file-preview">
                                    <span className="file-icon">{Icons.file}</span>
                                    <span className="file-name">{getFileName(files.hojaVida)}</span>
                                    <button 
                                        type="button" 
                                        className="file-remove"
                                        onClick={() => removeFile('hojaVida')}
                                    >
                                        {Icons.x}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="drop-icon">{Icons.upload}</div>
                                    <p className="drop-text">Adjuntar Hoja de Vida</p>
                                    <p className="drop-hint">PDF, DOC, DOCX (máx. 10MB)</p>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileChange(e, 'hojaVida')}
                                        className="file-input"
                                    />
                                </>
                            )}
                            {errors.hojaVida && <span className="error-message">{errors.hojaVida}</span>}
                        </div>

                        <div 
                            className={`file-drop-zone ${files.aprobacion ? 'has-file' : ''} ${errors.aprobacion ? 'error' : ''}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleFileDrop(e, 'aprobacion')}
                        >
                            {files.aprobacion ? (
                                <div className="file-preview">
                                    <span className="file-icon">{Icons.file}</span>
                                    <span className="file-name">{getFileName(files.aprobacion)}</span>
                                    <button 
                                        type="button" 
                                        className="file-remove"
                                        onClick={() => removeFile('aprobacion')}
                                    >
                                        {Icons.x}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="drop-icon">{Icons.upload}</div>
                                    <p className="drop-text">Aprobación de Recurso Adicional</p>
                                    <p className="drop-hint">PDF, DOC, DOCX, PNG, JPG (máx. 10MB)</p>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                        onChange={(e) => handleFileChange(e, 'aprobacion')}
                                        className="file-input"
                                    />
                                </>
                            )}
                            {errors.aprobacion && <span className="error-message">{errors.aprobacion}</span>}
                        </div>
                    </div>
                </div>

                <div className="info-banner">
                    <span className="info-icon">{Icons.info}</span>
                    <div className="info-content">
                        <strong>Información importante</strong>
                        <p>La solicitud será procesada y el área de Recursos Humanos recibirá la notificación correspondiente.</p>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleReset}
                    >
                        <span className="btn-icon">{Icons.trash}</span>
                        Limpiar Formulario
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">{Icons.send}</span>
                                Enviar Solicitud
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SolicitudVacantes;