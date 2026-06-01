import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Toaster, toast } from 'sonner';
import './Planta.css'; // Reutilizamos los excelentes estilos de Planta para mantener consistencia visual

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

const BaseInactiva = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Detección de vista a color autorizada
    const [isAuthorizedForColors] = useState(() => {
        const savedAuth = localStorage.getItem('color_view_authorized');
        return savedAuth === 'true';
    });

    const [enableColorView] = useState(() => {
        const saved = localStorage.getItem('enable_color_view');
        return saved === 'true';
    });

    // Estados para los filtros
    const [filters, setFilters] = useState({
        nombre: '',
        cedula: '',
        cargo: '',
        motivo_retiro: '',
        cliente: '',
        empresa: '',
        estado: ''
    });

    // Opciones únicas dinámicas para filtros
    const [options, setOptions] = useState({
        cargos: [],
        motivosRetiro: [],
        clientes: [],
        empresas: [],
        estados: []
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/planta-operacion/retirados');
            if (response.success) {
                setData(response.data);
                setFilteredData(response.data);
                generateUniqueOptions(response.data);
            } else {
                setError(response.message || 'Error al obtener los datos de la base inactiva');
            }
        } catch (err) {
            console.error("Error al obtener datos de base inactiva:", err);
            setError('Error de conexión con el servidor al cargar base inactiva');
        } finally {
            setLoading(false);
        }
    };

    const generateUniqueOptions = (allData) => {
        const getUnique = (field) => {
            return [...new Set(allData.map(item => item[field]).filter(Boolean))].sort();
        };

        setOptions({
            cargos: getUnique('cargo'),
            motivosRetiro: getUnique('motivo_retiro'),
            clientes: getUnique('cliente'),
            empresas: getUnique('empresa'),
            estados: getUnique('estado')
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Lógica del filtro reactivo
    useEffect(() => {
        const filtered = data.filter(item => {
            const matchNombre = !filters.nombre || (item.nombre && item.nombre.toLowerCase().includes(filters.nombre.toLowerCase()));
            const matchCedula = !filters.cedula || (item.cedula && item.cedula.toString().includes(filters.cedula));
            const matchCargo = !filters.cargo || item.cargo === filters.cargo;
            const matchMotivo = !filters.motivo_retiro || item.motivo_retiro === filters.motivo_retiro;
            const matchCliente = !filters.cliente || item.cliente === filters.cliente;
            const matchEmpresa = !filters.empresa || item.empresa === filters.empresa;
            const matchEstado = !filters.estado || item.estado === filters.estado;

            return matchNombre && matchCedula && matchCargo && matchMotivo && matchCliente && matchEmpresa && matchEstado;
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
            cargo: '',
            motivo_retiro: '',
            cliente: '',
            empresa: '',
            estado: ''
        });
    };

    // Estructura de las columnas a visualizar para retirados
    const columns = [
        { key: 'id_planta', label: 'ID' },
        { key: 'cedula', label: 'Cédula' },
        { key: 'nombre', label: 'Nombre Completo' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'fecha_ingreso', label: 'Fecha Ingreso' },
        { key: 'fecha_retiro', label: 'Fecha Retiro' },
        { key: 'motivo_retiro', label: 'Motivo Retiro' },
        { key: 'status', label: 'Status' },
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
        { key: 'observacion', label: 'Observación' },
        { key: 'estado', label: 'Estado' }
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
                <h2>📁 Base de Datos Inactiva</h2>
                <p>Visualización detallada de todo el personal retirado de la planta de operaciones.</p>
            </div>

            <div className="planta-layout">
                <div className="planta-card">
                    <div className="planta-toolbar">
                        <div className="toolbar-left">
                            <h3>📉 Personal Retirado</h3>
                            {!loading && data.length > 0 && (
                                <span className="planta-stats">
                                    Total registros: <strong>{data.length}</strong> {filteredData.length !== data.length && `(Filtrados: ${filteredData.length})`}
                                </span>
                            )}
                        </div>
                        <div className="toolbar-right">
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
                                    <label>Cargo</label>
                                    <select name="cargo" value={filters.cargo} onChange={handleFilterChange}>
                                        <option value="">Todos los cargos</option>
                                        {options.cargos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Motivo Retiro</label>
                                    <select name="motivo_retiro" value={filters.motivo_retiro} onChange={handleFilterChange}>
                                        <option value="">Todos los motivos</option>
                                        {options.motivosRetiro.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                                    <label>Empresa</label>
                                    <select name="empresa" value={filters.empresa} onChange={handleFilterChange}>
                                        <option value="">Todas las empresas</option>
                                        {options.empresas.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                                <p>Cargando registros de base inactiva...</p>
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
                                            <th key={col.key} style={{ borderBottom: '2px solid #ef4444', color: '#ef4444' }}>
                                                {col.label}
                                            </th>
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
                                                        {isDate ? formatDate(value) : badge ? (
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
                                <p>No se encontraron registros de retirados en la base inactiva.</p>
                                <button className="btn-reset" style={{ marginTop: '1rem' }} onClick={resetFilters}>Limpiar Filtros</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BaseInactiva;
