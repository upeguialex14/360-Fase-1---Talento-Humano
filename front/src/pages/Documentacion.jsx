import React, { useState } from 'react';
import './Documentacion.css';
import api from '../services/api';

const Icons = {
    upload: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

const Documentacion = () => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        identificacion: '',
        telefono: '',
        correo: '',
        ciudad: '',
        direccion: '',
        barrio: '',
        autorizacion: false
    });

    const [files, setFiles] = useState({
        hojaVida: null,
        actaDiploma: null,
        cedula: null,
        antecedentes: null,
        refPersonales: null,
        refLaborales: null,
        certBancario: null,
        certEps: null,
        certPension: null,
        civilHijos: null,
        tiHijos: null,
        certEscolar: null,
        cedulaPadres: null,
        registroParentesco: null,
        epsPadres: null,
        cedulaConyuge: null,
        certLaboralConyuge: null,
        docVinculacion: null,
        fotoCarnet: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({
                ...prev,
                [key]: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.autorizacion) {
            alert('Debe autorizar el tratamiento de datos personales.');
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        
        // Agregar archivos
        Object.keys(files).forEach(key => {
            if (files[key]) {
                data.append(key, files[key]);
            }
        });

        // Agregar datos del formulario como JSON
        data.append('data', JSON.stringify(formData));

        try {
            const result = await api.upload('/documentacion/vinculacion', data);

            if (result.success) {
                alert('¡Documentación enviada con éxito! Su proceso ha sido registrado.');
                window.location.reload();
            } else {
                throw new Error(result.message || 'Error al enviar');
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error al enviar la documentación: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderUploadCard = (id, label, hint, key, required = true) => (
        <div className="upload-card" key={id}>
            <div className="upload-card-header">
                {id} {label} {required && <span>*</span>}
            </div>
            {hint && <p className="item-hint">{hint}</p>}
            <div className="dropzone-area" onClick={() => document.getElementById(`file-${key}`).click()}>
                <input 
                    type="file" 
                    id={`file-${key}`} 
                    hidden 
                    onChange={(e) => handleFileChange(e, key)}
                    accept=".pdf,.jpg,.png,.jpeg"
                />
                {files[key] ? (
                    <div className="file-selected">
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                            {Icons.check} Archivo cargado: {files[key].name}
                        </span>
                    </div>
                ) : (
                    <>
                        <i>{Icons.upload}</i>
                        <p className="dropzone-text">Haz clic para seleccionar o arrastra el archivo</p>
                        <p className="dropzone-hint">Formato: PDF, JPG, PNG | Máx: 1 GB</p>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="vinculacion-container">
            <div className="vinculacion-header">
                <h1>Documentos de Vinculación</h1>
                <p>Formulario oficial de ingreso para el personal de Reval SAS y Multipagas SAS</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="vinculacion-card-base">
                    {/* Aviso Legal */}
                    <div className="legal-notice">
                        <p>
                            De acuerdo con lo establecido en la ley 1581 de 2012, reglamentada por el decreto 1377 de 2013, hago uso de mis datos personales y en general de la información obtenida en virtud de la relación comercial y contractual establecida con la empresa Reval SAS y Multipagas SAS o quien represente u ostente sus derechos, para que directamente o a través de terceros realicen el seguimiento en medios físicos, digitales o cualquier otro sobre mi información personal.
                        </p>
                        <p>
                            Los datos que se recolectan mediante el diligenciamiento de formatos o entrega de documentos serán tratados de manera leal y lícita para todo lo relacionado con el orden legal o contractual.
                        </p>
                    </div>

                    <div className="auth-section">
                        <input 
                            type="checkbox" 
                            id="autorizacion" 
                            name="autorizacion"
                            checked={formData.autorizacion}
                            onChange={handleInputChange}
                            className="auth-checkbox"
                            required
                        />
                        <label htmlFor="autorizacion" className="auth-label">
                            SÍ, autorizo el tratamiento de mis datos personales de acuerdo con la política de privacidad. *
                        </label>
                    </div>

                    {/* SECCIÓN A */}
                    <div className="form-section-header">
                        <span className="section-tag">Sección A</span>
                        <span className="section-title">DATOS PERSONALES DEL TRABAJADOR</span>
                        <p className="section-subtitle">Complete todos los campos con información precisa y en mayúsculas</p>
                    </div>

                    <div className="vinculacion-grid">
                        <div className="form-group">
                            <div className="label-wrapper">
                                <span className="item-code">A.01</span>
                                <span className="item-label">NOMBRE COMPLETO *</span>
                            </div>
                            <span className="item-hint">Escriba su nombre completo en Mayúscula</span>
                            <input 
                                type="text" 
                                name="nombreCompleto"
                                className="vinculacion-input"
                                placeholder="NOMBRE COMPLETO"
                                value={formData.nombreCompleto}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="label-wrapper">
                                <span className="item-code">A.02</span>
                                <span className="item-label">NÚMERO DE IDENTIFICACIÓN (CC) *</span>
                            </div>
                            <span className="item-hint">Digite su cédula SIN puntos ni comas</span>
                            <input 
                                type="text" 
                                name="identificacion"
                                className="vinculacion-input"
                                placeholder="1234567890"
                                value={formData.identificacion}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="label-wrapper">
                                <span className="item-code">A.03</span>
                                <span className="item-label">TELÉFONO / CELULAR *</span>
                            </div>
                            <span className="item-hint">Número de teléfono SIN puntos ni comas</span>
                            <input 
                                type="text" 
                                name="telefono"
                                className="vinculacion-input"
                                placeholder="3001234567"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="label-wrapper">
                                <span className="item-code">A.04</span>
                                <span className="item-label">CORREO ELECTRÓNICO *</span>
                            </div>
                            <input 
                                type="email" 
                                name="correo"
                                className="vinculacion-input"
                                placeholder="correo@ejemplo.com"
                                value={formData.correo}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="label-wrapper">
                                <span className="item-code">A.05</span>
                                <span className="item-label">CIUDAD DE RESIDENCIA *</span>
                            </div>
                            <select 
                                name="ciudad"
                                className="vinculacion-input"
                                value={formData.ciudad}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Elegir Ciudad</option>
                                <option value="Bogotá">Bogotá</option>
                                <option value="Medellín">Medellín</option>
                                <option value="Cali">Cali</option>
                                <option value="Barranquilla">Barranquilla</option>
                                <option value="Cartagena">Cartagena</option>
                                <option value="Santa Marta">Santa Marta</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <div className="label-wrapper">
                                <span className="item-code">A.06</span>
                                <span className="item-label">DIRECCIÓN DE RESIDENCIA *</span>
                            </div>
                            <span className="item-hint">Diligenciarla en mayúscula</span>
                            <input 
                                type="text" 
                                name="direccion"
                                className="vinculacion-input"
                                placeholder="CALLE 123 # 45-67"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="label-wrapper">
                                <span className="item-code">A.07</span>
                                <span className="item-label">BARRIO *</span>
                            </div>
                            <span className="item-hint">Diligenciarla en mayúscula</span>
                            <input 
                                type="text" 
                                name="barrio"
                                className="vinculacion-input"
                                placeholder="BARRIO EJEMPLO"
                                value={formData.barrio}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="vinculacion-card-base">
                    {/* SECCIÓN B */}
                    <div className="form-section-header">
                        <span className="section-tag">Sección B</span>
                        <span className="section-title">DOCUMENTOS PERSONALES</span>
                        <p className="section-subtitle">Adjunte todos los documentos solicitados en formato PDF</p>
                    </div>

                    <div className="organize-notice">
                        Es importante que de Manera Organizada pueda remitir todos los documentos en un solo PDF y que este nombrado como DOCUMENTOS PERSONALES + SU NOMBRE
                    </div>

                    {renderUploadCard('B.01', 'Hoja de vida actualizada y firmada', null, 'hojaVida')}
                    {renderUploadCard('B.02', 'Acta - diploma estudios, Certificado de cursos o diplomados', null, 'actaDiploma')}
                    {renderUploadCard('B.03', 'Cédula de ciudadanía ampliada al 150% legible', null, 'cedula')}
                    {renderUploadCard('B.04', 'Certificado de antecedentes judiciales y disciplinarios', 'No mayor a 30 días (Policía, Contraloría, Procuraduría)', 'antecedentes')}
                    {renderUploadCard('B.05', 'Referencias Personales (dos)', null, 'refPersonales')}
                    {renderUploadCard('B.06', 'Últimas (3) Referencias laborales', null, 'refLaborales')}
                    {renderUploadCard('B.07', 'Certificado bancario de Bancolombia', 'No mayor a 30 días (si tiene la cuenta activa)', 'certBancario', false)}
                    {renderUploadCard('B.08', 'Certificado de afiliación EPS o Consulta del ADRES', 'No mayor a 30 días', 'certEps')}
                    {renderUploadCard('B.09', 'Certificado de afiliación a fondo de pensiones', 'No mayor a 30 días', 'certPension')}
                </div>

                <div className="vinculacion-card-base">
                    {/* SECCIÓN C */}
                    <div className="form-section-header">
                        <span className="section-tag">Sección C</span>
                        <span className="section-title">DOCUMENTOS PARA AFILIACIONES</span>
                        <p className="section-subtitle">Documentos beneficiarios para inclusión caja de compensación</p>
                    </div>

                    <div className="organize-notice notice-purple">
                        <p style={{ color: '#d8b4fe', marginBottom: '0.5rem', fontWeight: 800 }}>Documentos Beneficiarios Para Inclusión Caja de Compensación</p>
                        Adjuntar los documentos completos en un solo PDF dependiendo del tipo de beneficiario y que el archivo este nombrado como DOC AFILIACIONES + SU NOMBRE
                    </div>

                    {renderUploadCard('C.01', 'Civil de nacimiento de cada uno de los hijos menores de 18 años', null, 'civilHijos')}
                    {renderUploadCard('C.02', 'Tarjeta de identidad de los niños mayores de 7 años', null, 'tiHijos')}
                    {renderUploadCard('C.03', 'Certificado escolar vigente hijos mayores de 12 años', null, 'certEscolar')}
                    {renderUploadCard('C.04', 'Cédula de ciudadanía al 150% legible (Padre a incluir)', 'Padres Mayores de 60 Años', 'cedulaPadres')}
                    {renderUploadCard('C.05', 'Registro civil de nacimiento del cotizante para parentesco', null, 'registroParentesco')}
                    {renderUploadCard('C.06', 'Certificado de afiliación EPS del padre a incluir', null, 'epsPadres')}
                    {renderUploadCard('C.07', 'Cédula de ciudadanía al 150% legible', 'Cónyuge', 'cedulaConyuge')}
                    {renderUploadCard('C.08', 'Certificado laboral no mayor a 30 días', null, 'certLaboralConyuge')}
                </div>

                <div className="vinculacion-card-base">
                    {/* SECCIÓN D & E */}
                    <div className="form-section-header">
                        <span className="section-tag">Sección D & E</span>
                        <span className="section-title">FINALIZACIÓN DE PROCESO</span>
                    </div>

                    <div className="organize-notice notice-green">
                        <p style={{ color: '#6ee7b7', marginBottom: '0.5rem', fontWeight: 800 }}>Documentos de Vinculación & Foto</p>
                        Adjunte los documentos finales y la fotografía para el carnet institucional.
                    </div>

                    {renderUploadCard('D.01', 'Documentos de Vinculación', null, 'docVinculacion')}
                    {renderUploadCard('E.01', 'Fotografía para carnet', 'Tamaño 3x4 fondo blanco', 'fotoCarnet')}
                </div>

                <div style={{ marginBottom: '4rem', display: 'flex', gap: '1.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-clear-nexus" onClick={() => window.location.reload()}>
                        Limpiar Todo
                    </button>
                    <button type="submit" className="btn-submit-nexus" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando Documentación...' : 'Enviar Formulario de Vinculación'}
                    </button>
                </div>

                <div className="info-banner-blue">
                    <i><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></i>
                    <div>
                        <h4>Información Importante</h4>
                        <p>Sus datos están protegidos bajo estándares de alta seguridad. Los archivos deben estar en formato PDF y el tamaño máximo es de 1 GB por cada carga.</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Documentacion;