import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// ─── Sub-componente: Dropdown personalizado con estética "Liquid Ether" ────────
const CustomDropdown = ({ label, name, value, options, onChange, placeholder = 'Seleccione...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (opt) => {
        onChange({ target: { name, value: opt } });
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`bd-form-group ${isOpen ? 'dropdown-active' : ''}`} ref={dropdownRef} style={{ zIndex: isOpen ? 1000 : 1 }}>
            <label>{label}</label>
            <div className="bd-custom-select-container">
                <div className={`bd-custom-select-toggle ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                    <span style={{ opacity: value ? 1 : 0.6 }}>{value || placeholder}</span>
                    <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', color: '#FFD700' }}>▼</span>
                </div>
                {isOpen && (
                    <div className="bd-custom-select-menu bd-custom-scrollbar">
                        <div className="bd-custom-select-search">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="bd-custom-select-options">
                            {filtered.length > 0
                                ? filtered.map((opt, i) => (
                                    <div
                                        key={i}
                                        className={`bd-custom-select-option ${value === opt ? 'selected' : ''}`}
                                        onClick={() => handleSelect(opt)}
                                    >
                                        <span>{opt}</span>
                                        {value === opt && <span className="bd-selected-dot" />}
                                    </div>
                                ))
                                : <div className="bd-custom-select-option" style={{ opacity: 0.5, cursor: 'default', justifyContent: 'center' }}>Sin resultados</div>
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Componente Principal ────────────────────────────────────────────────────
const CreacionUsuarioBase = () => {
    const initialForm = {
        tipo_identificacion: '',
        empresa: '',
        cedula: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        apellidos_nombres: '',
        cargo: '',
        fecha_ingreso: '',
        tipo_contrato: '',
        ciudad: '',
        unidad_negocio: '',
        cliente: '',
        ceco: '',
        oficina: '',
        fecha_vencimiento: '',
        sueldo_2026: '',
        auxilio_alimentacion: '',
        auxilio_adicional_transporte: '',
        bonificacion: '',
        auxilio_rodamientos_1q: '',
        auxilio_rodamientos_2q: '',
        auxilio_trans_extralegal: '',
        auxilio_conectividad: '',
        autorizacion_tramite_datos: '',
        expedicion_documento: '',
        genero: '',
        orientacion_sexual: '',
        poblacion_especial: '',
        grupo_etnico: '',
        fecha_nacimiento: '',
        estado_civil: '',
        nombre_pareja: '',
        nro_pareja: '',
        rh: '',
        enfermedades: '',
        otras_enfermedades: '',
        ultimo_nivel_estudio: '',
        nombre_titulo: '',
        correo_electronico: '',
        telefono: '',
        nombre_contacto_emergencia: '',
        parentesco_contacto: '',
        cel_emergencia: '',
        tel_fijo_emergencia: '',
        departamento: '',
        ciudad_residencia: '',
        barrio: '',
        direccion: '',
        estrato: '',
        tipo_vivienda: '',
        cuenta_vehiculo_propio: '',
        nro_hijos: '',
        fn_h1: '', nro_doc_h1: '',
        fn_h2: '', nro_doc_h2: '',
        fn_h3: '', nro_doc_h3: '',
        fn_h4: '', nro_doc_h4: '',
        fn_h5: '', nro_doc_h5: '',
        t_camisa: '',
        t_pantalon: '',
        t_zapatos: '',
        t_chaquetas: '',
        t_chalecos: '',
        familiar_en_empresa: '',
        compania: '',
        parentesco: '',
        hv_referida: '',
        nombre_referido: '',
        familiares_pep: '',
        porque_pep: '',
        cargo_publico: '',
        salud: '',
        pension: '',
        caja: '',
        cuenta_bancaria: '',
        fecha_retiro: '',
        motivo_retiro: '',
        motivo_confidencial: '',
        estado: 'ACTIVO',
        lider: '',
        aplica_dotacion: '',
    };

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Auto-componer apellidos_nombres
    useEffect(() => {
        const full = [formData.primer_nombre, formData.segundo_nombre, formData.primer_apellido, formData.segundo_apellido]
            .filter(Boolean).map(s => s.trim()).join(' ');
        setFormData(prev => ({ ...prev, apellidos_nombres: full }));
    }, [formData.primer_nombre, formData.segundo_nombre, formData.primer_apellido, formData.segundo_apellido]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cedula?.trim()) {
            setMessage({ type: 'error', text: '⚠️ La Cédula es obligatoria.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (!formData.apellidos_nombres?.trim()) {
            setMessage({ type: 'error', text: '⚠️ Debe ingresar al menos el Primer Nombre y Primer Apellido.' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await api.post('/etl/base-datos/crear', formData);
            if (response && response.success) {
                setMessage({ type: 'success', text: `✅ Colaborador "${formData.apellidos_nombres}" registrado exitosamente en Base de Datos.` });
                // Limpiar datos personales para el siguiente registro
                setFormData(prev => ({
                    ...initialForm,
                    empresa: prev.empresa,
                    cargo: prev.cargo,
                    ciudad: prev.ciudad,
                    unidad_negocio: prev.unidad_negocio,
                    cliente: prev.cliente,
                    oficina: prev.oficina,
                    tipo_contrato: prev.tipo_contrato,
                }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(response?.message || 'Error al registrar en el servidor');
            }
        } catch (error) {
            setMessage({ type: 'error', text: '❌ ' + (error.message || 'Error al conectar con el servidor.') });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    // ── Opciones de dropdowns ──
    const TIPOS_ID = ['CC', 'CE', 'PA', 'TI', 'RC', 'NIT', 'PEP'];
    const EMPRESAS = ['REVAL', 'MULTIPAGAS', 'MULTIVAL'];
    const CONTRATOS = ['APRENDIZ FIJO LECTIVO', 'APRENDIZAJE', 'FIJO', 'FIJO 4 HORAS', 'FIJO 6 HORAS', 'INDEFINIDO', 'INDEFINIDO 4 HORAS', 'INDEFINIDO 6 HORAS', 'INDEFINIDO -DIAS', 'INTEGRAL', 'OBRA LABOR 4 HORAS', 'OBRA LABOR 6 HORAS', 'OBRA O LABOR'];
    const CIUDADES = ['BOGOTA', 'CALI', 'MEDELLIN', 'BARRANQUILLA', 'BUCARAMANGA', 'CARTAGENA', 'PEREIRA', 'MANIZALES', 'ARMENIA', 'IBAGUE', 'NEIVA', 'PASTO', 'CUCUTA', 'VILLAVICENCIO', 'SANTA MARTA', 'MONTERIA', 'SINCELEJO', 'VALLEDUPAR', 'POPAYAN', 'TUNJA', 'DUITAMA', 'SOGAMOSO', 'PALMIRA', 'BELLO', 'ITAGUI', 'ENVIGADO', 'SABANETA', 'RIONEGRO', 'APARTADO', 'CAUCASIA', 'FLORIDABLANCA', 'GIRON', 'PIEDECUESTA', 'BARRANCABERMEJA', 'SOACHA', 'ZIPAQUIRA', 'FACATATIVA', 'CAJICA', 'CHIA', 'MADRID', 'TOCANCIPA', 'YUMBO', 'JAMUNDI', 'TULUA', 'BUGA', 'CARTAGO', 'DOSQUEBRADAS', 'SANTA ROSA DE CABAL', 'GIRARDOT', 'HONDA', 'LIBANO', 'ESPINAL', 'PITALITO', 'GARZÓN', 'NECOCLI', 'TURBO', 'MONTERÍA', 'RIOHACHA', 'MAICAO', 'VALLEDUPAR', 'FONSECA', 'OCAÑA', 'IPIALES', 'TUMACO', 'QUIBDO', 'ARAUCA', 'YOPAL', 'VILLAVICENCIO', 'FLORENCIA', 'LETICIA', 'INIRIDA', 'SAN JOSE DEL GUAVIARE', 'MITU', 'MOCOA', 'PUERTO CARREÑO', 'BUENAVENTURA', 'OTRA'];
    const UNIDADES = ['ESPECIALIZADO', 'U. TRANSACCIONAL', 'CSC', 'APRENDIZ', 'MI ATM'];
    const CLIENTES = ['REVAL', 'FUERZA DE VENTA EN CAMPO', 'LUKA', 'RED', 'MULTIPAGAS', 'BANCO AGRARIO', 'BANCO DE BOGOTA INHOUSE', 'BANCO DE BOGOTA', 'GESTORIA', 'BBVA', 'BANCO CAJA SOCIAL', 'BANCO DEL OCCIDENTE', 'BANCO POPULAR', 'CITIBANK', 'COOPCENTRAL', 'DAVIVIENDA', 'FINCOMERCIO', 'GESTORIA DE RED', 'BANCO ITAU', 'JARDIN BOTANICO', 'CB MOVIL', 'BANCOLOMBIA', 'MULTIPRODUCTO', 'DAVIPLATA', 'AV VILLAS', 'SCARE'];
    const GENEROS = ['MASCULINO', 'FEMENINO', 'NO BINARIO', 'PREFIERO NO DECIR', 'OTRO'];
    const ORIENTACIONES = ['HETEROSEXUAL', 'HOMOSEXUAL', 'BISEXUAL', 'PREFIERO NO DECIR', 'OTRO'];
    const POBLACIONES = ['NINGUNA', 'VICTIMA DE CONFLICTO ARMADO', 'PERSONA EN CONDICION DE DISCAPACIDAD', 'MADRE CABEZA DE FAMILIA', 'ADULTO MAYOR', 'MIGRANTE VENEZOLANO'];
    const ETNIAS = ['NINGUNA', 'INDIGENA', 'AFROCOLOMBIANO', 'RAIZAL', 'ROM/GITANO', 'PALENQUERO', 'MESTIZO'];
    const ESTADOS_CIVILES = ['SOLTERO(A)', 'CASADO(A)', 'UNION LIBRE', 'DIVORCIADO(A)', 'VIUDO(A)', 'SEPARADO(A)'];
    const RH = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    const NIVELES_ESTUDIO = ['PRIMARIA', 'BACHILLERATO', 'TECNICO', 'TECNOLOGO', 'PROFESIONAL', 'ESPECIALIZACION', 'MAESTRIA', 'DOCTORADO', 'NINGUNO'];
    const TIPOS_VIVIENDA = ['PROPIA', 'ARRENDADA', 'FAMILIAR', 'OTRA'];
    const ESTRATOS = ['1', '2', '3', '4', '5', '6'];
    const SI_NO = ['SI', 'NO'];
    const ESTADOS = ['ACTIVO', 'RETIRADO', 'VACANTE', 'LICENCIA', 'INCAPACIDAD'];
    const CARGOS = ['ANALISTA BACK I', 'ANALISTA BACK OFFICE - POSVENTA', 'ANALISTA BACK TECNOLOGIA', 'ANALISTA COMERCIAL', 'ANALISTA CONTABLE - VIATICOS Y ALQUILERES', 'ANALISTA CONTABLE - FACTURACIÓN DE VENTA Y CARTERA', 'ANALISTA DE CARTERA', 'ANALISTA DE CONCILIACION', 'ANALISTA DE GESTIÓN DOCUMENTAL', 'ANALISTA DE IMPUESTOS', 'ANALISTA DE MERCADEO', 'ANALISTA DE NOMINA', 'ANALISTA DE POLIGRAFIA', 'ANALISTA DE PREVENCIÓN RIESGO EN PERSONAS', 'ANALISTA DE PREVENCIÓN RIESGOS EN PROCESOS', 'ANALISTA DE SEGURIDAD DE LA INFORMACIÓN', 'ANALISTA DE SEGURIDAD Y SALUD EN EL TRABAJO VI', 'ANALISTA DE SELECCIÓN', 'ANALISTA DE TALENTO HUMANO', 'ANALISTA MI ATM', 'ANALISTA NOMINA', 'ANALISTA OPERATIVO', 'ANALISTA OPERATIVO BACK V', 'ANALISTA PREVENCION DE PROCESOS', 'ANALISTA TALENTO HUMANO', 'APERTURA DE CUENTAS', 'APRENDIZ SENA', 'APRENDIZ SENA FIJO LECTIVO', 'APRENDIZ SENA LECTIVO', 'ASESOR COMERCIAL', 'ASESOR COMERCIAL BALM', 'ASESOR COMERCIAL POSVENTA', 'AUDITOR DE CONTROL INTERNO', 'AUXILIAR ADMINISTRATIVO', 'AUXILIAR BACK', 'AUXILIAR BACK I', 'AUXILIAR BACK OFFICE', 'AUXILIAR CONTABLE', 'AUXILIAR CONTABLE - TRAFICO DE FACTURACIÓN', 'AUXILIAR DE BODEGA', 'AUXILIAR DE CONCILIACION', 'AUXILIAR DE MONITOREO', 'AUXILIAR DE MONITOREO ALTO RIESGO', 'AUXILIAR DE OPERACIONES', 'AUXILIAR DE OPERACIONES - CELULA', 'AUXILIAR DE OPERACIONES (MESA DE CONTROL)', 'AUXILIAR DE OPERACIONES (REVISION DOCUMENTAL)', 'AUXILIAR DE OPERACIONES BACK OFFICE - CALI', 'AUXILIAR DE SELECCION', 'AUXILIAR DE SERVICIOS GENERALES', 'AUXILIAR DE SST Y BIENESTAR', 'AUXILIAR MESA DE CONTROL', 'AUXILIAR OPERATIVO', 'AUXILIAR RECURSOS FISICOS', 'AUXILIAR SERVICIOS GENERALES', 'CAJERO', 'CAJERO COMPENSADOR', 'CAJERO DIRECTOR U.E', 'CAJERO PRINCIPAL I', 'CAJERO PRINCIPAL II', 'CAJERO RECAUDADOR I', 'CAJERO RECAUDADOR II', 'CAJERO SEGUNDO I', 'CAJERO SEGUNDO II', 'CAJERO SUPERNUMERARIO', 'COMPENSADOR', 'COMPENSADOR /DIRECCIONADOR 6 HORAS', 'CONDUCTOR', 'COORDINADOR BPO', 'COORDINADOR DE BPO Y BACK OFFICE', 'COORDINADOR DE MONITOREO JUNIOR', 'COORDINADOR DE OPERACIONES', 'COORDINADOR GESTORIA DE RED', 'COORDINADOR NACIONAL', 'COORDINADOR OPERATIVO', 'DIRECCIONADOR', 'DIRECTOR ADMINISTRATIVO', 'DIRECTOR COMERCIAL', 'DIRECTOR CONTABLE', 'DIRECTOR DE CONTROL INTERNO', 'DIRECTOR DE GESTION HUMANA', 'DIRECTOR DE PREVENCION DE RIESGO', 'DIRECTOR DE TECNOLOGIA', 'DIRECTOR FINANCIERO', 'DIRECTOR NUEVOS PROYECTOS', 'DIRECTORA COMERCIAL', 'DIRECTORA SUBSIDIOS', 'FORMADOR', 'GERENTE', 'GERENTE COMERCIAL REGIONAL', 'GERENTE COMERCIAL', 'GERENTE CORPORATIVO', 'GERENTE DE INNOVACION', 'GERENTE NACIONAL ADMINISTRATIVO Y DE OPERACIONES', 'GESTION ADMINISTRATIVA Y DE CARTERA', 'GESTOR COMERCIAL', 'GESTOR DE NEGOCIOS RRT', 'GESTOR DE RED', 'GESTOR TECNOLÓGICO', 'INGENIERO DE INFRAESTRUCTURA', 'INGENIERO DE SISTEMAS', 'INGENIERO DE TECNOLOGIAS DE LA INFORMACIÓN IX', 'INGENIERO DESARROLLADOR', 'INGENIERO QA', 'JEFE DE SERVICIO I', 'LIDER DE CONCILIACIÓN', 'LIDER DE EXCELENCIA', 'LIDER DE EXCELENCIA RED MI ATM', 'LIDER DE GESTION TECNOLOGICA', 'LÍDER DE IMPUESTOS', 'LIDER DE OPERACIONES', 'LIDER DE RECURSOS FISICOS Y ADMINISTRATIVOS', 'LIDER DE TALENTO HUMANO', 'LIDER GESTION DEL NEGOCIO', 'LIDER JURIDICO', 'MENSAJERO', 'OFICIOS VARIOS', 'ORIENTADOR', 'SUPERVISOR CGM', 'SUPERVISOR OPERATIVO II', 'SUPERVISOR OPERATIVO IV', 'TECNICO EN SISTEMA Y TELECOMUNICACIONES', 'TECNICO EN SISTEMAS', 'VACANTE'];

    return (
        <div className="page-container" style={{ padding: '2rem' }}>
            <style>{`
                /* ── Card Principal ── */
                .bd-form-card {
                    background: rgba(15, 19, 34, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 3rem;
                    max-width: 1300px;
                    margin: 2rem auto;
                    backdrop-filter: blur(25px) saturate(180%);
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    position: relative;
                }
                .bd-form-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 4px;
                    background: linear-gradient(90deg, transparent, #FFD700, transparent);
                    border-radius: 20px 20px 0 0;
                }
                .bd-header h1 {
                    color: #FFD700;
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-shadow: 0 0 20px rgba(255,215,0,0.3);
                }
                .bd-header p { color: #94a3b8; margin-top: 0.5rem; }

                /* ── Secciones ── */
                .bd-section {
                    margin-bottom: 3rem;
                    animation: bdFadeIn 0.6s ease-out forwards;
                    position: relative;
                }
                .bd-section:nth-child(1) { z-index: 14; }
                .bd-section:nth-child(2) { z-index: 13; }
                .bd-section:nth-child(3) { z-index: 12; }
                .bd-section:nth-child(4) { z-index: 11; }
                .bd-section:nth-child(5) { z-index: 10; }
                .bd-section:nth-child(6) { z-index: 9; }
                .bd-section:nth-child(7) { z-index: 8; }
                .bd-section:nth-child(8) { z-index: 7; }
                .bd-section:nth-child(9) { z-index: 6; }
                .bd-section:nth-child(10){ z-index: 5; }
                .bd-section:nth-child(11){ z-index: 4; }
                .bd-section:nth-child(12){ z-index: 3; }
                .bd-section:focus-within { z-index: 100 !important; }

                @keyframes bdFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .bd-section-title {
                    color: #FFD700;
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 1.8rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .bd-section-title::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,215,0,0.3), transparent);
                }

                /* ── Grid ── */
                .bd-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.8rem;
                }
                .bd-grid-3col { grid-template-columns: repeat(3, 1fr); }
                .bd-full { grid-column: 1 / -1; }

                /* ── Form Group ── */
                .bd-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                    position: relative;
                    transition: z-index 0.3s step-start;
                }
                .bd-form-group.dropdown-active { z-index: 9999 !important; }
                .bd-form-group label {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .bd-input {
                    background: rgba(15, 19, 34, 0.8) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 0.75rem 1.1rem;
                    color: #ffffff !important;
                    font-size: 0.95rem;
                    transition: all 0.3s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .bd-input:focus {
                    outline: none;
                    border-color: #FFD700 !important;
                    box-shadow: 0 0 18px rgba(255,215,0,0.12);
                    background: rgba(255,255,255,0.04) !important;
                    transform: translateY(-1px);
                }
                .bd-input[readonly] {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: rgba(0,0,0,0.3) !important;
                }
                .bd-textarea {
                    background: rgba(15, 19, 34, 0.8) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 0.75rem 1.1rem;
                    color: #ffffff !important;
                    font-size: 0.95rem;
                    transition: all 0.3s;
                    width: 100%;
                    box-sizing: border-box;
                    resize: vertical;
                    min-height: 80px;
                }
                .bd-textarea:focus {
                    outline: none;
                    border-color: #FFD700 !important;
                    box-shadow: 0 0 18px rgba(255,215,0,0.12);
                }

                /* ── Custom Dropdown ── */
                .bd-custom-select-container { position: relative; width: 100%; }
                .bd-custom-select-toggle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-left: 4px solid rgba(255,215,0,0.6);
                    border-radius: 10px;
                    padding: 0.75rem 1.1rem;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.95rem;
                }
                .bd-custom-select-toggle:hover,
                .bd-custom-select-toggle.open {
                    border-color: #FFD700;
                    border-left-color: #FFD700;
                    background: rgba(15,19,34,0.9);
                    box-shadow: 0 0 20px rgba(255,215,0,0.15);
                }
                .bd-custom-select-menu {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0; right: 0;
                    background: #111827;
                    border: 1px solid rgba(255,215,0,0.5);
                    border-radius: 12px;
                    z-index: 10000 !important;
                    max-height: 320px;
                    overflow-y: auto;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.9);
                    animation: bdDropdown 0.25s ease;
                }
                @keyframes bdDropdown {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .bd-custom-select-search {
                    position: sticky;
                    top: 0;
                    background: #111827;
                    padding: 10px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .bd-custom-select-search input {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 8px;
                    padding: 8px 12px;
                    color: #fff;
                    font-size: 0.85rem;
                    box-sizing: border-box;
                }
                .bd-custom-select-search input:focus {
                    outline: none;
                    border-color: #FFD700;
                }
                .bd-custom-select-option {
                    padding: 10px 18px;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-left: 3px solid transparent;
                }
                .bd-custom-select-option:hover {
                    background: linear-gradient(90deg, rgba(255,215,0,0.12) 0%, transparent 100%);
                    color: #fff;
                    border-left-color: #FFD700;
                    padding-left: 24px;
                }
                .bd-custom-select-option.selected {
                    background: rgba(255,215,0,0.15);
                    color: #FFD700;
                    font-weight: 700;
                    border-left-color: #FFD700;
                }
                .bd-selected-dot {
                    width: 7px; height: 7px;
                    background: #FFD700;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #FFD700;
                }
                .bd-custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .bd-custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
                .bd-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.4); border-radius: 6px; }

                /* ── Hijos grid ── */
                .bd-hijos-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .bd-hijo-row {
                    display: grid;
                    grid-template-columns: auto 1fr 1fr;
                    gap: 0.8rem;
                    align-items: end;
                    background: rgba(255,215,0,0.03);
                    border: 1px solid rgba(255,215,0,0.08);
                    border-radius: 10px;
                    padding: 1rem;
                }
                .bd-hijo-label {
                    color: #FFD700;
                    font-weight: 700;
                    font-size: 0.9rem;
                    align-self: center;
                    padding-bottom: 4px;
                }

                /* ── Banners ── */
                .bd-message {
                    padding: 1.2rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: center;
                    font-weight: 600;
                    backdrop-filter: blur(10px);
                }
                .bd-message.success {
                    background: rgba(34,197,94,0.1);
                    color: #4ade80;
                    border: 1px solid rgba(34,197,94,0.3);
                }
                .bd-message.error {
                    background: rgba(239,68,68,0.1);
                    color: #f87171;
                    border: 1px solid rgba(239,68,68,0.3);
                }

                /* ── Botón Submit ── */
                .bd-btn-save {
                    background: linear-gradient(135deg, #FFD700 0%, #e5b500 100%);
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
                    box-shadow: 0 10px 25px rgba(255,215,0,0.2);
                }
                .bd-btn-save:hover:not(:disabled) {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 15px 35px rgba(255,215,0,0.4);
                }
                .bd-btn-save:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* ── Info chip ── */
                .bd-info-chip {
                    font-size: 0.72rem;
                    color: #64748b;
                    margin-top: -2px;
                    padding-left: 4px;
                }

                @media (max-width: 900px) {
                    .bd-grid { grid-template-columns: 1fr; }
                    .bd-grid-3col { grid-template-columns: 1fr; }
                    .bd-hijos-grid { grid-template-columns: 1fr; }
                    .bd-form-card { padding: 1.5rem; }
                }
            `}</style>

            <div className="bd-form-card">
                <header className="bd-header" style={{ marginBottom: '2.5rem' }}>
                    <h1>🗄️ Nuevo Colaborador — Base de Datos</h1>
                    <p>Complete el formulario para registrar manualmente un nuevo colaborador en la Base de Datos Maestra.</p>
                </header>

                {message.text && (
                    <div className={`bd-message ${message.type}`}>{message.text}</div>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">

                    {/* ══ SECCIÓN 1: Identificación ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">📋 Identificación</div>
                        <div className="bd-grid">
                            <CustomDropdown label="Tipo Identificación" name="tipo_identificacion" value={formData.tipo_identificacion} options={TIPOS_ID} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Cédula / Documento *</label>
                                <input type="text" name="cedula" className="bd-input" value={formData.cedula} onChange={handleChange} required placeholder="Número de identificación" />
                            </div>
                            <div className="bd-form-group">
                                <label>Expedición Documento</label>
                                <input type="text" name="expedicion_documento" className="bd-input" value={formData.expedicion_documento} onChange={handleChange} placeholder="Ciudad de expedición" />
                            </div>
                            <div className="bd-form-group">
                                <label>Primer Nombre *</label>
                                <input type="text" name="primer_nombre" className="bd-input" value={formData.primer_nombre} onChange={handleChange} required placeholder="Primer nombre" />
                            </div>
                            <div className="bd-form-group">
                                <label>Segundo Nombre</label>
                                <input type="text" name="segundo_nombre" className="bd-input" value={formData.segundo_nombre} onChange={handleChange} placeholder="Segundo nombre (opcional)" />
                            </div>
                            <div className="bd-form-group">
                                <label>Primer Apellido *</label>
                                <input type="text" name="primer_apellido" className="bd-input" value={formData.primer_apellido} onChange={handleChange} required placeholder="Primer apellido" />
                            </div>
                            <div className="bd-form-group">
                                <label>Segundo Apellido</label>
                                <input type="text" name="segundo_apellido" className="bd-input" value={formData.segundo_apellido} onChange={handleChange} placeholder="Segundo apellido (opcional)" />
                            </div>
                            <div className="bd-form-group">
                                <label>Nombre Completo (Automático)</label>
                                <input type="text" name="apellidos_nombres" className="bd-input" value={formData.apellidos_nombres} readOnly placeholder="Se genera automáticamente" />
                                <span className="bd-info-chip">Generado desde los campos de nombre</span>
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 2: Información Laboral ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">💼 Información Laboral</div>
                        <div className="bd-grid">
                            <CustomDropdown label="Empresa" name="empresa" value={formData.empresa} options={EMPRESAS} onChange={handleChange} />
                            <CustomDropdown label="Cargo" name="cargo" value={formData.cargo} options={CARGOS} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Fecha Ingreso</label>
                                <input type="date" name="fecha_ingreso" className="bd-input" value={formData.fecha_ingreso} onChange={handleChange} />
                            </div>
                            <CustomDropdown label="Tipo Contrato" name="tipo_contrato" value={formData.tipo_contrato} options={CONTRATOS} onChange={handleChange} />
                            <CustomDropdown label="Ciudad" name="ciudad" value={formData.ciudad} options={CIUDADES} onChange={handleChange} />
                            <CustomDropdown label="Unidad de Negocio" name="unidad_negocio" value={formData.unidad_negocio} options={UNIDADES} onChange={handleChange} />
                            <CustomDropdown label="Cliente" name="cliente" value={formData.cliente} options={CLIENTES} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>CECO</label>
                                <input type="text" name="ceco" className="bd-input" value={formData.ceco} onChange={handleChange} placeholder="Centro de costos Helisa" />
                            </div>
                            <div className="bd-form-group">
                                <label>Oficina</label>
                                <input type="text" name="oficina" className="bd-input" value={formData.oficina} onChange={handleChange} placeholder="Nombre de la oficina" />
                            </div>
                            <div className="bd-form-group">
                                <label>Fecha Vencimiento Contrato</label>
                                <input type="date" name="fecha_vencimiento" className="bd-input" value={formData.fecha_vencimiento} onChange={handleChange} />
                            </div>
                            <CustomDropdown label="Estado" name="estado" value={formData.estado} options={ESTADOS} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Líder</label>
                                <input type="text" name="lider" className="bd-input" value={formData.lider} onChange={handleChange} placeholder="Nombre del líder" />
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 3: Compensación ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">💰 Compensación y Auxilios</div>
                        <div className="bd-grid">
                            <div className="bd-form-group">
                                <label>Sueldo 2026</label>
                                <input type="number" name="sueldo_2026" className="bd-input" value={formData.sueldo_2026} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                            <div className="bd-form-group">
                                <label>Aux. Alimentación</label>
                                <input type="number" name="auxilio_alimentacion" className="bd-input" value={formData.auxilio_alimentacion} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                            <div className="bd-form-group">
                                <label>Aux. Transp. Adicional</label>
                                <input type="number" name="auxilio_adicional_transporte" className="bd-input" value={formData.auxilio_adicional_transporte} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                            <div className="bd-form-group">
                                <label>Bonificación</label>
                                <input type="number" name="bonificacion" className="bd-input" value={formData.bonificacion} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                            <div className="bd-form-group">
                                <label>Rodamientos 1Q</label>
                                <input type="number" name="auxilio_rodamientos_1q" className="bd-input" value={formData.auxilio_rodamientos_1q} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                            <div className="bd-form-group">
                                <label>Rodamientos 2Q</label>
                                <input type="number" name="auxilio_rodamientos_2q" className="bd-input" value={formData.auxilio_rodamientos_2q} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                            <div className="bd-form-group">
                                <label>Transp. Extralegal</label>
                                <input type="number" name="auxilio_trans_extralegal" className="bd-input" value={formData.auxilio_trans_extralegal} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                            <div className="bd-form-group">
                                <label>Conectividad</label>
                                <input type="number" name="auxilio_conectividad" className="bd-input" value={formData.auxilio_conectividad} onChange={handleChange} placeholder="0" min="0" />
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 4: Datos Personales ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">👤 Datos Personales</div>
                        <div className="bd-grid">
                            <CustomDropdown label="Género" name="genero" value={formData.genero} options={GENEROS} onChange={handleChange} />
                            <CustomDropdown label="Orientación Sexual" name="orientacion_sexual" value={formData.orientacion_sexual} options={ORIENTACIONES} onChange={handleChange} />
                            <CustomDropdown label="Población Especial" name="poblacion_especial" value={formData.poblacion_especial} options={POBLACIONES} onChange={handleChange} />
                            <CustomDropdown label="Grupo Étnico" name="grupo_etnico" value={formData.grupo_etnico} options={ETNIAS} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Fecha Nacimiento</label>
                                <input type="date" name="fecha_nacimiento" className="bd-input" value={formData.fecha_nacimiento} onChange={handleChange} />
                            </div>
                            <CustomDropdown label="Estado Civil" name="estado_civil" value={formData.estado_civil} options={ESTADOS_CIVILES} onChange={handleChange} />
                            <CustomDropdown label="RH" name="rh" value={formData.rh} options={RH} onChange={handleChange} />
                            <CustomDropdown label="Autorización Trámite Datos" name="autorizacion_tramite_datos" value={formData.autorizacion_tramite_datos} options={['SI', 'NO']} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Enfermedades</label>
                                <input type="text" name="enfermedades" className="bd-input" value={formData.enfermedades} onChange={handleChange} placeholder="Ej: Diabetes, Hipertensión" />
                            </div>
                            <div className="bd-form-group">
                                <label>Otras Enfermedades</label>
                                <input type="text" name="otras_enfermedades" className="bd-input" value={formData.otras_enfermedades} onChange={handleChange} placeholder="Otras condiciones médicas" />
                            </div>
                            <CustomDropdown label="Último Nivel de Estudio" name="ultimo_nivel_estudio" value={formData.ultimo_nivel_estudio} options={NIVELES_ESTUDIO} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Nombre del Título</label>
                                <input type="text" name="nombre_titulo" className="bd-input" value={formData.nombre_titulo} onChange={handleChange} placeholder="Ej: Ingeniería de Sistemas" />
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 5: Pareja ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">💑 Información de Pareja</div>
                        <div className="bd-grid">
                            <div className="bd-form-group">
                                <label>Nombre Pareja</label>
                                <input type="text" name="nombre_pareja" className="bd-input" value={formData.nombre_pareja} onChange={handleChange} placeholder="Nombre completo de la pareja" />
                            </div>
                            <div className="bd-form-group">
                                <label>N° Doc. Pareja</label>
                                <input type="text" name="nro_pareja" className="bd-input" value={formData.nro_pareja} onChange={handleChange} placeholder="Número de documento" />
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 6: Contacto ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">📞 Contacto</div>
                        <div className="bd-grid">
                            <div className="bd-form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" name="correo_electronico" className="bd-input" value={formData.correo_electronico} onChange={handleChange} placeholder="correo@ejemplo.com" />
                            </div>
                            <div className="bd-form-group">
                                <label>Teléfono</label>
                                <input type="text" name="telefono" className="bd-input" value={formData.telefono} onChange={handleChange} placeholder="Número de celular o fijo" />
                            </div>
                            <div className="bd-form-group">
                                <label>Nombre Contacto Emergencia</label>
                                <input type="text" name="nombre_contacto_emergencia" className="bd-input" value={formData.nombre_contacto_emergencia} onChange={handleChange} placeholder="Nombre completo" />
                            </div>
                            <div className="bd-form-group">
                                <label>Parentesco Emergencia</label>
                                <input type="text" name="parentesco_contacto" className="bd-input" value={formData.parentesco_contacto} onChange={handleChange} placeholder="Ej: Madre, Esposo(a)" />
                            </div>
                            <div className="bd-form-group">
                                <label>Cel. Emergencia</label>
                                <input type="text" name="cel_emergencia" className="bd-input" value={formData.cel_emergencia} onChange={handleChange} placeholder="Celular de emergencia" />
                            </div>
                            <div className="bd-form-group">
                                <label>Tel. Fijo Emergencia</label>
                                <input type="text" name="tel_fijo_emergencia" className="bd-input" value={formData.tel_fijo_emergencia} onChange={handleChange} placeholder="Teléfono fijo de emergencia" />
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 7: Residencia ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">🏠 Residencia</div>
                        <div className="bd-grid">
                            <div className="bd-form-group">
                                <label>Departamento</label>
                                <input type="text" name="departamento" className="bd-input" value={formData.departamento} onChange={handleChange} placeholder="Departamento de residencia" />
                            </div>
                            <div className="bd-form-group">
                                <label>Ciudad Residencia</label>
                                <input type="text" name="ciudad_residencia" className="bd-input" value={formData.ciudad_residencia} onChange={handleChange} placeholder="Ciudad de residencia" />
                            </div>
                            <div className="bd-form-group">
                                <label>Barrio</label>
                                <input type="text" name="barrio" className="bd-input" value={formData.barrio} onChange={handleChange} placeholder="Barrio o localidad" />
                            </div>
                            <div className="bd-form-group">
                                <label>Dirección</label>
                                <input type="text" name="direccion" className="bd-input" value={formData.direccion} onChange={handleChange} placeholder="Dirección completa" />
                            </div>
                            <CustomDropdown label="Estrato" name="estrato" value={formData.estrato} options={ESTRATOS} onChange={handleChange} />
                            <CustomDropdown label="Tipo Vivienda" name="tipo_vivienda" value={formData.tipo_vivienda} options={TIPOS_VIVIENDA} onChange={handleChange} />
                            <CustomDropdown label="¿Cuenta con Vehículo Propio?" name="cuenta_vehiculo_propio" value={formData.cuenta_vehiculo_propio} options={SI_NO} onChange={handleChange} />
                        </div>
                    </div>

                    {/* ══ SECCIÓN 8: Hijos ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">👶 Hijos</div>
                        <div className="bd-grid" style={{ marginBottom: '1.5rem' }}>
                            <div className="bd-form-group">
                                <label>Número de Hijos</label>
                                <input type="number" name="nro_hijos" className="bd-input" value={formData.nro_hijos} onChange={handleChange} placeholder="0" min="0" max="10" />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className="bd-hijo-row">
                                    <span className="bd-hijo-label">H{n}</span>
                                    <div className="bd-form-group">
                                        <label>Fecha Nac. Hijo {n}</label>
                                        <input type="date" name={`fn_h${n}`} className="bd-input" value={formData[`fn_h${n}`]} onChange={handleChange} />
                                    </div>
                                    <div className="bd-form-group">
                                        <label>N° Doc. Hijo {n}</label>
                                        <input type="text" name={`nro_doc_h${n}`} className="bd-input" value={formData[`nro_doc_h${n}`]} onChange={handleChange} placeholder="Documento" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══ SECCIÓN 9: Dotación ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">👕 Tallas y Dotación</div>
                        <div className="bd-grid">
                            <div className="bd-form-group">
                                <label>T. Camisa</label>
                                <input type="text" name="t_camisa" className="bd-input" value={formData.t_camisa} onChange={handleChange} placeholder="Ej: M, L, XL, 38" />
                            </div>
                            <div className="bd-form-group">
                                <label>T. Pantalón</label>
                                <input type="text" name="t_pantalon" className="bd-input" value={formData.t_pantalon} onChange={handleChange} placeholder="Ej: 30, 32, 34" />
                            </div>
                            <div className="bd-form-group">
                                <label>T. Zapatos</label>
                                <input type="text" name="t_zapatos" className="bd-input" value={formData.t_zapatos} onChange={handleChange} placeholder="Ej: 38, 40, 42" />
                            </div>
                            <div className="bd-form-group">
                                <label>T. Chaqueta</label>
                                <input type="text" name="t_chaquetas" className="bd-input" value={formData.t_chaquetas} onChange={handleChange} placeholder="Ej: M, L, XL" />
                            </div>
                            <div className="bd-form-group">
                                <label>T. Chaleco</label>
                                <input type="text" name="t_chalecos" className="bd-input" value={formData.t_chalecos} onChange={handleChange} placeholder="Ej: M, L, XL" />
                            </div>
                            <CustomDropdown label="¿Aplica Dotación?" name="aplica_dotacion" value={formData.aplica_dotacion} options={SI_NO} onChange={handleChange} />
                        </div>
                    </div>

                    {/* ══ SECCIÓN 10: Afiliaciones ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">🏥 Afiliaciones y Cuenta Bancaria</div>
                        <div className="bd-grid">
                            <div className="bd-form-group">
                                <label>Salud (EPS)</label>
                                <input type="text" name="salud" className="bd-input" value={formData.salud} onChange={handleChange} placeholder="Nombre de la EPS" />
                            </div>
                            <div className="bd-form-group">
                                <label>Pensión</label>
                                <input type="text" name="pension" className="bd-input" value={formData.pension} onChange={handleChange} placeholder="Fondo de pensiones" />
                            </div>
                            <div className="bd-form-group">
                                <label>Caja de Compensación</label>
                                <input type="text" name="caja" className="bd-input" value={formData.caja} onChange={handleChange} placeholder="Nombre de la caja" />
                            </div>
                            <div className="bd-form-group">
                                <label>Cuenta Bancaria</label>
                                <input type="text" name="cuenta_bancaria" className="bd-input" value={formData.cuenta_bancaria} onChange={handleChange} placeholder="Número de cuenta" />
                            </div>
                        </div>
                    </div>

                    {/* ══ SECCIÓN 11: Familiar en Empresa / Referencias / PEP ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">🔗 Referencias y Declaraciones</div>
                        <div className="bd-grid">
                            <CustomDropdown label="¿Familiar en la Empresa?" name="familiar_en_empresa" value={formData.familiar_en_empresa} options={SI_NO} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Compañía (Familiar)</label>
                                <input type="text" name="compania" className="bd-input" value={formData.compania} onChange={handleChange} placeholder="Empresa del familiar" />
                            </div>
                            <div className="bd-form-group">
                                <label>Parentesco (Familiar)</label>
                                <input type="text" name="parentesco" className="bd-input" value={formData.parentesco} onChange={handleChange} placeholder="Ej: Hermano, Primo" />
                            </div>
                            <CustomDropdown label="¿HV Referida?" name="hv_referida" value={formData.hv_referida} options={SI_NO} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>Referido Por</label>
                                <input type="text" name="nombre_referido" className="bd-input" value={formData.nombre_referido} onChange={handleChange} placeholder="Nombre de quien refirió" />
                            </div>
                            <CustomDropdown label="¿Familiares PEP?" name="familiares_pep" value={formData.familiares_pep} options={SI_NO} onChange={handleChange} />
                            <div className="bd-form-group">
                                <label>¿Por qué PEP?</label>
                                <input type="text" name="porque_pep" className="bd-input" value={formData.porque_pep} onChange={handleChange} placeholder="Describir relación PEP" />
                            </div>
                            <CustomDropdown label="¿Ejerce Cargo Público?" name="cargo_publico" value={formData.cargo_publico} options={SI_NO} onChange={handleChange} />
                        </div>
                    </div>

                    {/* ══ SECCIÓN 12: Retiro ══ */}
                    <div className="bd-section">
                        <div className="bd-section-title">🚪 Información de Retiro (Si aplica)</div>
                        <div className="bd-grid">
                            <div className="bd-form-group">
                                <label>Fecha de Retiro</label>
                                <input type="date" name="fecha_retiro" className="bd-input" value={formData.fecha_retiro} onChange={handleChange} />
                            </div>
                            <div className="bd-form-group">
                                <label>Motivo de Retiro</label>
                                <input type="text" name="motivo_retiro" className="bd-input" value={formData.motivo_retiro} onChange={handleChange} placeholder="Motivo de retiro" />
                            </div>
                            <div className="bd-form-group">
                                <label>Motivo Confidencial</label>
                                <input type="text" name="motivo_confidencial" className="bd-input" value={formData.motivo_confidencial} onChange={handleChange} placeholder="Información confidencial de retiro" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="bd-btn-save" disabled={loading}>
                        {loading ? '⏳ Registrando...' : '💾 Registrar en Base de Datos'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreacionUsuarioBase;
