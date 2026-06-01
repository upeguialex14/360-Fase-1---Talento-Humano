import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Toaster, toast } from 'sonner';
import './Planta.css';

const COLOR_PALETTES = {
  vacante_sobrante: {
    'OP': { bg: '#f1f5f9', color: '#475569' },
    'AP': { bg: '#f1f5f9', color: '#475569' },
    'NI': { bg: '#f1f5f9', color: '#475569' },
    'CP': { bg: '#f1f5f9', color: '#475569' },
    'VA': { bg: '#e0f2fe', color: '#0369a1' },
    'TP': { bg: '#dcfce7', color: '#15803d' },
    'SP': { bg: '#f1f5f9', color: '#475569' },
    'TD': { bg: '#fef9c3', color: '#a16207' },
    'SO': { bg: '#b91c1c', color: '#ffffff' },
    'TPS': { bg: '#f3e8ff', color: '#7e22ce' },
    'CD': { bg: '#f1f5f9', color: '#475569' },
    'ADM': { bg: '#f1f5f9', color: '#475569' },
    'VADM': { bg: '#e0f2fe', color: '#0369a1' },
    'VAOP': { bg: '#e0f2fe', color: '#0369a1' },
    'VAP': { bg: '#e0f2fe', color: '#0369a1' },
    'VD': { bg: '#e0f2fe', color: '#0369a1' },
  },
  status: {
    'INCAPACIDAD': { bg: '#fef9c3', color: '#a16207' },
    'ACTIVO SENA': { bg: '#f1f5f9', color: '#475569' },
    'VACANTE': { bg: '#e0f2fe', color: '#0369a1' },
    'VACACIONES': { bg: '#fee2e2', color: '#b91c1c' },
    'LICENCIA DE MATERNIDAD': { bg: '#dcfce7', color: '#15803d' },
    'LICENCIA NO REMUNERADA': { bg: '#e0f2fe', color: '#0369a1' },
    'LICENCIA POR LUTO': { bg: '#f3e8ff', color: '#7e22ce' },
    'ACTIVO DIAS': { bg: '#f1f5f9', color: '#475569' },
    'DIA DE LA FAMILIA': { bg: '#fef9c3', color: '#a16207' },
    'AUSENCIA INJUSTIFICADA': { bg: '#fee2e2', color: '#b91c1c' },
    'CALAMIDAD': { bg: '#e0f2fe', color: '#0369a1' },
    'MEDICO': { bg: '#f3e8ff', color: '#7e22ce' },
    'HOSPITALIZADO': { bg: '#fef9c3', color: '#a16207' },
    'SANCION': { bg: '#e0f2fe', color: '#0369a1' },
    'LICENCIA DE PATERNIDAD': { bg: '#dcfce7', color: '#15803d' },
    'LICENCIA REMUNERADA': { bg: '#ffedd5', color: '#c2410c' },
    'PERMISO': { bg: '#f1f5f9', color: '#475569' },
    'ACTIVO': { bg: '#e0f2fe', color: '#0369a1' }
  },
  estado: {
    'FUERO MEDICO': { bg: '#e0f2fe', color: '#0369a1' },
    'PROCESO CAMBIO DE CONTRATO': { bg: '#fef9c3', color: '#a16207' },
    'MADRES GESTANTES': { bg: '#065f46', color: '#ffffff' },
    'LICENCIA DE MATERNIDAD': { bg: '#f3e8ff', color: '#7e22ce' },
    'COMPENSADOR': { bg: '#fca5a5', color: '#991b1b' },
    'FUERO MEDICO,COMPENSADOR': { bg: '#e0f2fe', color: '#0369a1' },
    'COMPENSADOR,MADRES GESTANTES': { bg: '#065f46', color: '#ffffff' },
    'CEDIDO AL SENA': { bg: '#fee2e2', color: '#b91c1c' },
    'CEDIDO AL SENA,DISCAPACIDAD': { bg: '#fee2e2', color: '#b91c1c' },
    'FUERO PENSION': { bg: '#f1f5f9', color: '#475569' }
  },
  contrato: {
    'INDEFINIDO': { bg: '#e0f2fe', color: '#0369a1' },
    'OBRA O LABOR': { bg: '#fef9c3', color: '#a16207' },
    'APRENDIZAJE': { bg: '#f3e8ff', color: '#7e22ce' },
    'FIJO': { bg: '#f1f5f9', color: '#475569' },
    'INDEFINIDO -DIAS': { bg: '#e2e8f0', color: '#475569' },
    'INTEGRAL': { bg: '#fee2e2', color: '#b91c1c' },
    'APRENDIZ FIJO LECTIVO': { bg: '#dcfce7', color: '#15803d' },
    'PRESTACION DE SERVICIOS': { bg: '#fee2e2', color: '#b91c1c' },
    'FIJO 6 HORAS': { bg: '#f1f5f9', color: '#475569' },
    'FIJO 4 HORAS': { bg: '#f1f5f9', color: '#475569' },
    'INDEFINIDO 6 HORAS': { bg: '#e0f2fe', color: '#0369a1' },
    'INDEFINIDO 4 HORAS': { bg: '#e0f2fe', color: '#0369a1' },
    'OBRA LABOR 6 HORAS': { bg: '#fef9c3', color: '#a16207' },
    'OBRA LABOR 4 HORAS': { bg: '#fef9c3', color: '#a16207' },
    'PRESTACION DE SERVICIOS 4 HORAS': { bg: '#fee2e2', color: '#b91c1c' }
  },
  tipo_empleado: {
    'OPERATIVO FRONT': { bg: '#e0f2fe', color: '#0369a1' },
    'ADMINISTRATIVO': { bg: '#dcfce7', color: '#15803d' },
    'OPERATIVO': { bg: '#fef9c3', color: '#a16207' },
    'COMERCIAL': { bg: '#fee2e2', color: '#b91c1c' }
  }
};

const Planta = () => {
    // Control de vista a color
    const [isAuthorizedForColors, setIsAuthorizedForColors] = useState(() => {
        const savedAuth = localStorage.getItem('color_view_authorized');
        if (savedAuth === 'true') return true;
        const params = new URLSearchParams(window.location.search);
        if (params.get('colorView') === 'true') {
            localStorage.setItem('color_view_authorized', 'true');
            localStorage.setItem('enable_color_view', 'true');
            return true;
        }
        return false;
    });

    const [enableColorView, setEnableColorView] = useState(() => {
        const saved = localStorage.getItem('enable_color_view');
        return saved === 'true';
    });

    const handleToggleColorView = () => {
        const newValue = !enableColorView;
        setEnableColorView(newValue);
        localStorage.setItem('enable_color_view', String(newValue));
    };

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Estados para edición
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Estados para transferencia
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [transferringRow, setTransferringRow] = useState(null);
    const [isTransferring, setIsTransferring] = useState(false);


    // Estados para los filtros
    const [filters, setFilters] = useState({
        nombre: '',
        cedula: '',
        contrato: '',
        cargo: '',
        tipo_empleado: '',
        regional: '',
        ciudad: '',
        cliente: '',
        empresa: '',
        estado: ''
    });

    // Opciones para los dropdowns (se llenarán dinámicamente)
    const [options, setOptions] = useState({
        contratos: [],
        cargos: [],
        tiposEmpleado: [],
        regionales: [],
        ciudades: [],
        clientes: [],
        empresas: [],
        estados: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/planta-operacion');
            if (response.success) {
                setData(response.data);
                setFilteredData(response.data);
                generateOptions(response.data);
            } else {
                setError(response.message || 'Error al cargar los datos');
            }
        } catch (err) {
            console.error("Error al obtener datos de planta:", err);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const generateOptions = (allData) => {
        const getUnique = (field) => {
            return [...new Set(allData.map(item => item[field]).filter(Boolean))].sort();
        };

        setOptions({
            contratos: getUnique('contrato'),
            cargos: getUnique('cargo'),
            tiposEmpleado: getUnique('tipo_empleado'),
            regionales: getUnique('regional'),
            ciudades: getUnique('ciudad'),
            clientes: getUnique('cliente'),
            empresas: getUnique('empresa'),
            estados: getUnique('estado')
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Lógica de filtrado
    useEffect(() => {
        const filtered = data.filter(item => {
            const matchNombre = !filters.nombre || (item.nombre && item.nombre.toLowerCase().includes(filters.nombre.toLowerCase()));
            const matchCedula = !filters.cedula || (item.cedula && item.cedula.toString().includes(filters.cedula));
            const matchContrato = !filters.contrato || item.contrato === filters.contrato;
            const matchCargo = !filters.cargo || item.cargo === filters.cargo;
            const matchTipoEmpleado = !filters.tipo_empleado || item.tipo_empleado === filters.tipo_empleado;
            const matchRegional = !filters.regional || item.regional === filters.regional;
            const matchCiudad = !filters.ciudad || item.ciudad === filters.ciudad;
            const matchCliente = !filters.cliente || item.cliente === filters.cliente;
            const matchEmpresa = !filters.empresa || item.empresa === filters.empresa;
            const matchEstado = !filters.estado || item.estado === filters.estado;

            return matchNombre && matchCedula && matchContrato && matchCargo && 
                   matchTipoEmpleado && matchRegional && matchCiudad && 
                   matchCliente && matchEmpresa && matchEstado;
        });
        setFilteredData(filtered);
    }, [filters, data]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            nombre: '',
            cedula: '',
            contrato: '',
            cargo: '',
            tipo_empleado: '',
            regional: '',
            ciudad: '',
            cliente: '',
            empresa: '',
            estado: ''
        });
    };

    // Funciones para edición
    const handleEdit = (row) => {
        setEditingRow(row);
        setEditFormData({ ...row });
        setEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const response = await api.put(`/planta-operacion/${editingRow.id_planta}`, editFormData);
            if (response.success) {
                const updatedData = data.map(item => item.id_planta === editingRow.id_planta ? { ...item, ...editFormData } : item);
                setData(updatedData);
                setEditModalOpen(false);
                toast.success('¡Registro actualizado exitosamente!');
            } else {
                toast.error('Error al guardar: ' + (response.message || 'Error desconocido'));
            }
        } catch (err) {
            console.error("Error updating record:", err);
            toast.error('Error de conexión con el servidor al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    // Abrir modal de transferencia
    const handleOpenTransfer = (row) => {
        setTransferringRow(row);
        setTransferModalOpen(true);
    };

    // Ejecutar la transferencia (limpiar o eliminar)
    const handleExecuteTransfer = async (type) => {
        setIsTransferring(true);
        const endpoint = `/planta-operacion/${transferringRow.id_planta}/transferir-${type}`;
        try {
            const response = await api.post(endpoint);
            if (response.success) {
                toast.success(response.message || '¡Transferencia completada con éxito!');
                setTransferModalOpen(false);
                setTransferringRow(null);
                
                // Actualizar los datos locales de la tabla
                if (type === 'eliminar') {
                    // Si se elimina, quitamos la fila completa de data
                    const updatedData = data.filter(item => item.id_planta !== transferringRow.id_planta);
                    setData(updatedData);
                } else {
                    // Si se limpia, limpiamos los datos personales locales y dejamos la fila con status 'VACANTE'
                    const updatedData = data.map(item => {
                        if (item.id_planta === transferringRow.id_planta) {
                            return {
                                ...item,
                                cedula: null,
                                nombre: null,
                                fecha_ingreso: null,
                                fecha_retiro: null,
                                motivo_retiro: null,
                                correo: null,
                                correo_corp: null,
                                usuario_ad: null,
                                usuario_osticket: null,
                                banco: null,
                                cuenta_bancaria: null,
                                tipo_cuenta: null,
                                novedad: null,
                                fecha_inicial: null,
                                fecha_final: null,
                                dias_ausencia: 0,
                                estado: null,
                                status: 'VACANTE',
                                observacion: null
                            };
                        }
                        return item;
                    });
                    setData(updatedData);
                }
            } else {
                toast.error(response.message || 'Error al realizar la transferencia');
            }
        } catch (err) {
            console.error("Error executing transfer:", err);
            toast.error('Error de conexión con el servidor al transferir');
        } finally {
            setIsTransferring(false);
        }
    };


    // Columnas basadas en la estructura real de la tabla planta_operaciones
    const columns = [
        { key: 'acciones', label: 'Acciones' },
        { key: 'id_planta', label: 'ID' },
        { key: 'empleador', label: 'Empleador' },
        { key: 'cedula', label: 'Cédula' },
        { key: 'nombre', label: 'Nombre Completo' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'fecha_ingreso', label: 'Fecha Ingreso' },
        { key: 'contrato', label: 'Contrato' },
        { key: 'tipo_empleado', label: 'Tipo Empleado' },
        { key: 'regional', label: 'Regional' },
        { key: 'zona', label: 'Zona' },
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'unidad_negocio', label: 'Unidad Negocio' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'empresa', label: 'Empresa' },
        { key: 'codigo_ptr', label: 'Cód. PTR' },
        { key: 'cc_helisa', label: 'CC Helisa' },
        { key: 'oficina', label: 'Oficina' },
        { key: 'vacante_sobrante', label: 'Vacante/Sob.' },
        { key: 'planta_aprobada', label: 'Planta Aprob.' },
        { key: 'supervisor_gerente', label: 'Supervisor/Gerente' },
        { key: 'status', label: 'Status' },
        { key: 'novedad', label: 'Novedad' },
        { key: 'motivo_retiro', label: 'Motivo Retiro' },
        { key: 'fecha_inicial', label: 'Fecha Inicial' },
        { key: 'fecha_final', label: 'Fecha Final' },
        { key: 'fecha_retiro', label: 'Fecha Retiro' },
        { key: 'traslado_oficina_destino', label: 'Destino Traslado' },
        { key: 'dias_ausencia', label: 'Días Ausencia' },
        { key: 'observacion', label: 'Observación' },
        { key: 'jornada', label: 'Jornada' },
        { key: 'correo', label: 'Correo' },
        { key: 'correo_corp', label: 'Correo Corporativo' },
        { key: 'usuario_ad', label: 'Usuario AD' },
        { key: 'estado', label: 'Estado' },
        { key: 'banco', label: 'Banco' },
        { key: 'cuenta_bancaria', label: 'Cuenta' },
        { key: 'tipo_cuenta', label: 'Tipo Cuenta' }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('es-ES');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="page page-container">
            <Toaster position="top-center" richColors />
            <div className="planta-header">
                <h2>🏭 Planta de Operación</h2>
                <p>Visualización detallada de todo el personal operativo en formato Excel.</p>
            </div>

            <div className="planta-layout">
                <div className="planta-card">
                    <div className="planta-toolbar">
                        <div className="toolbar-left">
                            <h3>📊 Registros de Planta</h3>
                            {!loading && data.length > 0 && (
                                <span className="planta-stats">
                                    Total registros: <strong>{data.length}</strong> {filteredData.length !== data.length && `(Filtrados: ${filteredData.length})`}
                                </span>
                            )}
                        </div>
                        <div className="toolbar-right">
                            {isAuthorizedForColors && (
                                <button 
                                    className={`btn-color-toggle ${enableColorView ? 'active' : ''}`}
                                    onClick={handleToggleColorView}
                                    style={{
                                        marginRight: '1rem',
                                        background: enableColorView ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#475569',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.6rem 1.2rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    🎨 {enableColorView ? 'Vista Color Activa' : 'Activar Vista Color'}
                                </button>
                            )}
                            <button 
                                className={`btn-filter ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                🔍 {showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="filters-panel">
                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label>Cédula</label>
                                    <input 
                                        type="text" 
                                        name="cedula" 
                                        placeholder="Buscar por cédula..." 
                                        value={filters.cedula}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Nombre</label>
                                    <input 
                                        type="text" 
                                        name="nombre" 
                                        placeholder="Buscar por nombre..." 
                                        value={filters.nombre}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Contrato</label>
                                    <select name="contrato" value={filters.contrato} onChange={handleFilterChange}>
                                        <option value="">Todos los contratos</option>
                                        {options.contratos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Cargo</label>
                                    <select name="cargo" value={filters.cargo} onChange={handleFilterChange}>
                                        <option value="">Todos los cargos</option>
                                        {options.cargos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Tipo Empleado</label>
                                    <select name="tipo_empleado" value={filters.tipo_empleado} onChange={handleFilterChange}>
                                        <option value="">Todos los tipos</option>
                                        {options.tiposEmpleado.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Regional</label>
                                    <select name="regional" value={filters.regional} onChange={handleFilterChange}>
                                        <option value="">Todas las regionales</option>
                                        {options.regionales.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Ciudad</label>
                                    <select name="ciudad" value={filters.ciudad} onChange={handleFilterChange}>
                                        <option value="">Todas las ciudades</option>
                                        {options.ciudades.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Cliente</label>
                                    <select name="cliente" value={filters.cliente} onChange={handleFilterChange}>
                                        <option value="">Todos los clientes</option>
                                        {options.clientes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Estado</label>
                                    <select name="estado" value={filters.estado} onChange={handleFilterChange}>
                                        <option value="">Todos los estados</option>
                                        {options.estados.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-actions">
                                    <button className="btn-reset" onClick={resetFilters}>Limpiar Filtros</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="excel-container">
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Cargando información de la base de datos...</p>
                            </div>
                        ) : error ? (
                            <div className="empty-state">
                                <span className="icon">⚠️</span>
                                <p>{error}</p>
                                <button 
                                    className="btn-upload" 
                                    style={{ width: 'auto', padding: '0.5rem 1.5rem', marginTop: '1rem' }}
                                    onClick={fetchData}
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : filteredData.length > 0 ? (
                            <table className="excel-table">
                                <thead>
                                    <tr>
                                        {columns.map(col => (
                                            <th key={col.key}>{col.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={row.id_planta || index}>
                                            {columns.map(col => {
                                                const value = row[col.key];
                                                const isDate = col.key.startsWith('fecha');
                                                const getBadgeStyle = (colKey, val) => {
                                                    if (!enableColorView || !val) return null;
                                                    const cleanVal = String(val).trim().toUpperCase();
                                                    const palette = COLOR_PALETTES[colKey];
                                                    if (palette && palette[cleanVal]) {
                                                        return palette[cleanVal];
                                                    }
                                                    return null;
                                                };
                                                const badge = getBadgeStyle(col.key, value);

                                                return (
                                                    <td key={col.key}>
                                                        {col.key === 'acciones' ? (
                                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                                <button 
                                                                    className="btn-edit" 
                                                                    style={{ padding: '0.3rem 0.5rem', background: '#FFCD04', color: '#2A2A54', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                    onClick={() => handleEdit(row)}
                                                                    title="Editar registro"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                {(row.nombre || row.cedula) && (
                                                                    <button 
                                                                        className="btn-transfer-row" 
                                                                        style={{ 
                                                                            padding: '0.3rem 0.5rem', 
                                                                            background: '#fee2e2', 
                                                                            color: '#b91c1c', 
                                                                            border: '1px solid #fca5a5', 
                                                                            borderRadius: '4px', 
                                                                            cursor: 'pointer', 
                                                                            fontWeight: 'bold',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gap: '0.2rem'
                                                                        }}
                                                                        onClick={() => handleOpenTransfer(row)}
                                                                        title="Transferir a Retiros"
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                                            <circle cx="8.5" cy="7" r="4" />
                                                                            <line x1="17" y1="8" x2="21" y2="12" />
                                                                            <line x1="21" y1="8" x2="17" y2="12" />
                                                                        </svg>
                                                                        <span style={{ fontSize: '0.9rem', lineHeight: '1' }}>→</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : isDate ? formatDate(value) : badge ? (
                                                            <span style={{
                                                                backgroundColor: badge.bg,
                                                                color: badge.color,
                                                                padding: '0.25rem 0.75rem',
                                                                borderRadius: '12px',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.8rem',
                                                                display: 'inline-block',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {value}
                                                            </span>
                                                        ) : (value ?? '-')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <span className="icon">📂</span>
                                <p>No se encontraron registros que coincidan con los filtros.</p>
                                <button className="btn-reset" style={{ marginTop: '1rem' }} onClick={resetFilters}>Limpiar Filtros</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Edición */}
            {editModalOpen && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <div className="edit-modal-header">
                            <h3>✏️ Editar Registro</h3>
                            <button className="btn-close-modal" onClick={() => setEditModalOpen(false)}>×</button>
                        </div>
                        <div className="edit-form-grid">
                            {columns.filter(c => c.key !== 'acciones' && c.key !== 'id_planta').map(col => {
                                const isColorSelect = ['vacante_sobrante', 'status', 'estado', 'contrato', 'tipo_empleado'].includes(col.key);
                                if (isColorSelect) {
                                    const selectOptions = Object.keys(COLOR_PALETTES[col.key]);
                                    const currentValue = editFormData[col.key] || '';
                                    const currentPalette = enableColorView ? COLOR_PALETTES[col.key][currentValue.trim().toUpperCase()] : null;
                                    return (
                                        <div key={col.key} className="edit-form-group">
                                            <label>{col.label}</label>
                                            <select 
                                                name={col.key}
                                                value={currentValue}
                                                onChange={handleEditChange}
                                                className="edit-input edit-select-colored"
                                                style={{
                                                    backgroundColor: currentPalette ? currentPalette.bg : 'rgba(15, 23, 42, 0.6)',
                                                    color: currentPalette ? currentPalette.color : 'white',
                                                    fontWeight: '600',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '8px',
                                                    padding: '0.75rem 1rem',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="" style={{ background: '#0f172a', color: 'white' }}>Selecciona una opción...</option>
                                                {selectOptions.map(opt => (
                                                    <option 
                                                        key={opt} 
                                                        value={opt}
                                                        style={enableColorView ? {
                                                            backgroundColor: COLOR_PALETTES[col.key][opt].bg,
                                                            color: COLOR_PALETTES[col.key][opt].color,
                                                            fontWeight: '600'
                                                        } : {
                                                            background: '#0f172a',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={col.key} className="edit-form-group">
                                        <label>{col.label}</label>
                                        <input 
                                            type={col.key.startsWith('fecha') ? 'date' : 'text'}
                                            name={col.key}
                                            value={editFormData[col.key] ? (col.key.startsWith('fecha') && editFormData[col.key] ? new Date(editFormData[col.key]).toISOString().split('T')[0] : editFormData[col.key]) : ''}
                                            onChange={handleEditChange}
                                            className="edit-input"
                                            placeholder={`Ingresa ${col.label.toLowerCase()}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="edit-modal-actions">
                            <button 
                                className="btn-edit-cancel"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={`btn-edit-save ${isSaving ? 'saving' : ''}`}
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <><span className="save-spinner"></span> Guardando...</>
                                ) : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Transferencia a Retiros */}
            {transferModalOpen && transferringRow && (
                <div className="transfer-modal-overlay">
                    <div className="transfer-modal-content">
                        <button className="btn-close-modal" onClick={() => setTransferModalOpen(false)}>×</button>
                        <div className="transfer-modal-header">
                            <div className="transfer-header-title">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}>
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="17" y1="8" x2="21" y2="12" />
                                    <line x1="21" y1="8" x2="17" y2="12" />
                                </svg>
                                <span className="title-text">Transferir a Retiros</span>
                            </div>
                            <p className="subtitle-text">Selecciona qué acción deseas realizar con este empleado</p>
                        </div>

                        {/* Tarjeta de Resumen */}
                        <div className="transfer-summary-card">
                            <div className="summary-grid">
                                <div className="summary-col">
                                    <span className="summary-label">Código</span>
                                    <span className="summary-value code-value">MOD-{String(transferringRow.id_planta).padStart(4, '0')}</span>
                                </div>
                                <div className="summary-col">
                                    <span className="summary-label">Cédula</span>
                                    <span className="summary-value">{transferringRow.cedula || '-'}</span>
                                </div>
                            </div>

                            <div className="summary-row-full">
                                <span className="summary-label">Nombre Completo</span>
                                <span className="summary-value name-value">{transferringRow.nombre || '-'}</span>
                            </div>

                            <div className="summary-grid">
                                <div className="summary-col">
                                    <span className="summary-label">Cargo</span>
                                    <span className="summary-value">{transferringRow.cargo || '-'}</span>
                                </div>
                                <div className="summary-col">
                                    <span className="summary-label">Regional</span>
                                    <span className="summary-value">{transferringRow.regional || '-'}</span>
                                </div>
                            </div>

                            <div className="summary-grid">
                                <div className="summary-col">
                                    <span className="summary-label">Fecha Ingreso</span>
                                    <span className="summary-value">{formatDate(transferringRow.fecha_ingreso)}</span>
                                </div>
                                <div className="summary-col">
                                    <span className="summary-label">Correo</span>
                                    <span className="summary-value email-value" title={transferringRow.correo}>{transferringRow.correo || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="transfer-options-section">
                            <h4 className="options-title">Selecciona una opción:</h4>

                            {/* Opción 1: Transferir y Limpiar */}
                            <button 
                                className="transfer-option-btn option-clean"
                                onClick={() => handleExecuteTransfer('limpiar')}
                                disabled={isTransferring}
                            >
                                <div className="option-icon">🗑️</div>
                                <div className="option-text-container">
                                    <span className="option-btn-title">Transferir a Retiros y LIMPIAR datos</span>
                                    <p className="option-btn-desc">
                                        El empleado será transferido a Retiros. Los datos se limpiarán pero la fila con el código MOD-{String(transferringRow.id_planta).padStart(4, '0')} quedará vacía (vacante) en planta de operaciones.
                                    </p>
                                </div>
                            </button>

                            {/* Opción 2: Transferir y Eliminar */}
                            <button 
                                className="transfer-option-btn option-delete"
                                onClick={() => handleExecuteTransfer('eliminar')}
                                disabled={isTransferring}
                            >
                                <div className="option-icon">×</div>
                                <div className="option-text-container">
                                    <span className="option-btn-title">Transferir a Retiros y ELIMINAR TODO</span>
                                    <p className="option-btn-desc">
                                        El empleado será transferido a Retiros. La fila completa incluyendo el código MOD-{String(transferringRow.id_planta).padStart(4, '0')} será eliminada definitivamente.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Planta;
