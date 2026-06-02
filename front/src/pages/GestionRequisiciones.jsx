import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './GestionRequisiciones.css';
import { calcularDiasMora, calcularMoraPromedio } from '../utils/calcularMora';


// Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Opciones para selects
const TIPOS_CONTRATO = [
    { value: '', label: 'Seleccionar...' },
    { value: 'Indefinido', label: 'Indefinido' },
    { value: 'Temporal', label: 'Temporal' },
    { value: 'Obra o Labor', label: 'Obra o Labor' }
];

const ESTADOS = [
    { value: '', label: 'Todos' },
    { value: 'Recibido', label: 'Recibido' },
    { value: 'Evaluación', label: 'Evaluación' },
    { value: 'Revisión', label: 'Revisión' },
    { value: 'Rechazado', label: 'Rechazado' },
    { value: 'Aceptado', label: 'Aceptado' },
    { value: 'Cerrado', label: 'Cerrado' }
];

// Iconos SVG
const Icons = {
    search: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
        </svg>
    ),
    filter: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    ),
    download: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    ),
    eye: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    ),
    close: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    chart: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
    ),
    table: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
    ),
    user: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    ),
    file: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
    ),
    downloadFile: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    )
};

/**
 * Página de Gestión de Requisiciones
 * Tabla dinámica tipo Excel con métricas de cumplimiento y mora
 */
const GestionRequisiciones = () => {
    const { user } = useAuth();
    const [requisiciones, setRequisiciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' o 'dashboard'
    
    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    
    // Modal de detalles
    const [selectedReq, setSelectedReq] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'candidatos', 'historial'
    const [historial, setHistorial] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    // Estadísticas
    const [estadisticas, setEstadisticas] = useState(null);
    const [analistas, setAnalistas] = useState([]);
    
    // Formulario de candidatos
    const [showCandidateForm, setShowCandidateForm] = useState(false);
    const [candidateData, setCandidateData] = useState({
        nombre_candidato: '',
        cedula: '',
        telefono: '',
        correo: '',
        estado: 'Enviado a Selección',
        resultado_entrevista: ''
    });

    const pageAccess = user?.pages?.find(p => p.page_code === 'GESTION_REQUISICIONES');
    const canEdit = pageAccess?.can_edit === 1 || user?.role_id === 1;
    
    // Verificar si es analista líder o admin
    const isAdminOrLider = user?.role_id === 1 || user?.role_code === 'ANALISTA_LIDER';

    // Cargar requisiciones
    const fetchRequisiciones = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (busqueda) params.append('busqueda', busqueda);
            if (estadoFilter) params.append('estado', estadoFilter);
            
            const res = await api.get(`/requisiciones?${params.toString()}`);
            if (res.success) {
                setRequisiciones(res.data);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Error al cargar las requisiciones');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar estadísticas
    const fetchEstadisticas = async () => {
        try {
            const res = await api.get('/requisiciones/estadisticas');
            if (res.success) {
                setEstadisticas(res.data);
            }
        } catch (err) {
            console.error('Error cargando estadísticas:', err);
        }
    };

    // Cargar analistas
    const fetchAnalistas = async () => {
        try {
            const res = await api.get('/requisiciones/analistas');
            if (res.success) {
                setAnalistas(res.data);
            }
        } catch (err) {
            console.error('Error cargando analistas:', err);
        }
    };

    useEffect(() => {
        fetchRequisiciones();
        fetchEstadisticas();
        if (isAdminOrLider) {
            fetchAnalistas();
        }
    }, []);

    useEffect(() => {
        // Debounce para búsqueda
        const timer = setTimeout(() => {
            fetchRequisiciones();
        }, 300);
        return () => clearTimeout(timer);
    }, [busqueda, estadoFilter]);

    // Actualizar requisición
    const handleUpdate = async (id, field, value) => {
        if (!canEdit) return;
        try {
            await api.put(`/requisiciones/${id}`, { [field]: value });
            fetchRequisiciones();
            fetchEstadisticas();
        } catch (err) {
            console.error('Error actualizando requisición:', err);
        }
    };

    // Asignar analista
    const handleAsignarAnalista = async (reqId, analistaId) => {
        if (!canEdit) return;
        try {
            await api.put(`/requisiciones/${reqId}`, { analista_asignado_id: analistaId || null });
            fetchRequisiciones();
        } catch (err) {
            console.error('Error asignando analista:', err);
        }
    };

    // Exportar CSV
    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (busqueda) params.append('busqueda', busqueda);
            if (estadoFilter) params.append('estado', estadoFilter);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/requisiciones/exportar?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'requisiciones.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exportando CSV:', err);
        }
    };

    // Abrir modal de detalles y cargar datos adicionales
    const openDetails = async (req) => {
        setSelectedReq(req);
        setShowModal(true);
        setActiveTab('general');
        setShowCandidateForm(false); // Reset form state
        
        setLoadingDetails(true);
        try {
            const [histRes, candRes] = await Promise.all([
                api.get(`/requisiciones/${req.id}/historial`),
                api.get(`/requisiciones/${req.id}/candidatos`)
            ]);
            
            if (histRes.success) setHistorial(histRes.data);
            if (candRes.success) setCandidatos(candRes.data);
        } catch (err) {
            console.error('Error cargando detalles adicionales:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Registrar candidato
    const handleSubmitCandidato = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/requisiciones/${selectedReq.id}/candidatos`, candidateData);
            if (res.success) {
                // Refrescar lista de candidatos e historial
                const [histRes, candRes] = await Promise.all([
                    api.get(`/requisiciones/${selectedReq.id}/historial`),
                    api.get(`/requisiciones/${selectedReq.id}/candidatos`)
                ]);
                if (histRes.success) setHistorial(histRes.data);
                if (candRes.success) setCandidatos(candRes.data);
                
                // Limpiar formulario
                setShowCandidateForm(false);
                setCandidateData({
                    nombre_candidato: '',
                    cedula: '',
                    telefono: '',
                    correo: '',
                    estado: 'Enviado a Selección',
                    resultado_entrevista: ''
                });
            }
        } catch (err) {
            console.error('Error registrando candidato:', err);
        }
    };

    // Formatear fecha
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-CO');
    };

    // Obtener color de estado
    const getEstadoColor = (estado) => {
        const colors = {
            'Recibido': '#3b82f6',
            'Evaluación': '#f59e0b',
            'Revisión': '#8b5cf6',
            'Rechazado': '#ef4444',
            'Aceptado': '#10b981',
            'Cerrado': '#6b7280'
        };
        return colors[estado] || '#6b7280';
    };

    // Calcular estadísticas para dashboard
    const getDashboardStats = () => {
        if (!estadisticas?.porEstado) return null;
        
        const enProceso = (estadisticas.porEstado['Evaluación'] || 0) + 
                         (estadisticas.porEstado['Revisión'] || 0) + 
                         (estadisticas.porEstado['Recibido'] || 0);
        const cerradas = (estadisticas.porEstado['Cerrado'] || 0) + (estadisticas.porEstado['Aceptado'] || 0);
        const rechazadas = estadisticas.porEstado['Rechazado'] || 0;
        
        return {
            total: estadisticas.total,
            enProceso,
            cerradas,
            rechazadas,
            cumplimiento: Math.round(estadisticas.cumplimientoPromedio),
            moraPromedio: calcularMoraPromedio(requisiciones),
            recursos: estadisticas.totalRecursos
        };
    };

    const stats = getDashboardStats();

    return (
        <div className="gestion-requisiciones">
            <div className="page-header">
                <div className="header-left">
                    <h1>Gestión de Requisiciones</h1>
                    <p className="page-subtitle">Centralización de solicitudes de personal</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-new"
                        disabled={!canEdit}
                        style={{ opacity: !canEdit ? 0.5 : 1, cursor: !canEdit ? 'not-allowed' : 'pointer' }}
                    >
                        <span className="btn-icon">+</span>
                        Nueva Requisición
                    </button>
                    <button 
                        className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        {Icons.table}
                        Tabla
                    </button>
                    <button 
                        className={`view-toggle ${viewMode === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setViewMode('dashboard')}
                    >
                        {Icons.chart}
                        Dashboard
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <>
                    <div className="filters-bar">
                        <div className="search-box">
                            <span className="search-icon">{Icons.search}</span>
                            <input
                                type="text"
                                placeholder="Buscar por N° Req, cargo, cliente, empresa o regional..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        
                        <select
                            className="filter-select"
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                        >
                            {ESTADOS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        
                        <button className="btn-export" onClick={handleExport}>
                            {Icons.download}
                            Exportar CSV
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="requisiciones-table">
                            <thead>
                                <tr>
                                    <th>N° Req</th>
                                    <th>Gestión</th>
                                    <th>F. Llegada</th>
                                    <th>Mes</th>
                                    <th>Empresa</th>
                                    <th>Cliente</th>
                                    <th>Regional</th>
                                    <th>U. Negocio</th>
                                    <th>Zona</th>
                                    <th>Cargo</th>
                                    <th>Cant.</th>
                                    <th>Ciudad</th>
                                    <th>Oficina</th>
                                    <th>Justificación</th>
                                    <th>Detalle Libre</th>
                                    <th>Líder</th>
                                    <th>Tipo Contrato</th>
                                    <th>Estado</th>
                                    <th>D. Mora</th>
                                    <th>% Cump.</th>
                                    {isAdminOrLider && <th>Asignar Analista</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={isAdminOrLider ? 22 : 21} className="loading-cell">
                                            Cargando requisiciones...
                                        </td>
                                    </tr>
                                ) : requisiciones.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdminOrLider ? 22 : 21} className="empty-cell">
                                            No se encontraron requisiciones
                                        </td>
                                    </tr>
                                ) : (
                                    requisiciones.map((req, index) => (
                                        <tr key={req.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                                            <td className="codigo-req">{req.codigo_req}</td>
                                            <td>
                                                <button 
                                                    className="btn-export" 
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                                    onClick={() => openDetails(req)}
                                                >
                                                    Gestionar
                                                </button>
                                            </td>
                                            <td>{formatDate(req.fecha_llegada)}</td>
                                            <td>{req.mes || '-'}</td>
                                            <td>{req.empresa || '-'}</td>
                                            <td>{req.cliente || '-'}</td>
                                            <td>{req.regional || '-'}</td>
                                            <td>{req.unidad_negocio || '-'}</td>
                                            <td>{req.zona || '-'}</td>
                                            <td>{req.cargo}</td>
                                            <td>{req.cantidad || 1}</td>
                                            <td>{req.ciudad || '-'}</td>
                                            <td>{req.oficina || '-'}</td>
                                            <td>{req.justificacion || '-'}</td>
                                            <td className="detalle-cell" title={req.detalle}>
                                                {req.detalle ? (req.detalle.length > 30 ? req.detalle.substring(0, 30) + '...' : req.detalle) : '-'}
                                            </td>
                                            <td>{req.solicitante_nombre || req.lider || '-'}</td>
                                            <td>
                                                <select
                                                    className="inline-select"
                                                    value={req.tipo_contrato || ''}
                                                    onChange={(e) => handleUpdate(req.id, 'tipo_contrato', e.target.value)}
                                                    disabled={!canEdit}
                                                >
                                                    {TIPOS_CONTRATO.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    className="inline-select estado-select"
                                                    value={req.estado || ''}
                                                    onChange={(e) => handleUpdate(req.id, 'estado', e.target.value)}
                                                    style={{ borderColor: getEstadoColor(req.estado) }}
                                                    disabled={!canEdit}
                                                >
                                                    {ESTADOS.filter(e => e.value).map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`mora-badge ${calcularDiasMora(req.created_at) > 0 ? 'has-mora' : ''}`}>
                                                    {calcularDiasMora(req.created_at)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="cumplimiento-bar">
                                                    <div 
                                                        className="cumplimiento-fill"
                                                        style={{ 
                                                            width: `${req.porcentaje_cumplimiento || 100}%`,
                                                            backgroundColor: req.porcentaje_cumplimiento >= 80 ? '#10b981' : 
                                                                              req.porcentaje_cumplimiento >= 60 ? '#f59e0b' : '#ef4444'
                                                        }}
                                                    />
                                                    <span className="cumplimiento-text">{req.porcentaje_cumplimiento || 100}%</span>
                                                </div>
                                            </td>
                                            {isAdminOrLider && (
                                                <td>
                                                    <select
                                                        className="inline-select analista-select"
                                                        value={req.analista_asignado_id || ''}
                                                        onChange={(e) => handleAsignarAnalista(req.id, e.target.value)}
                                                        disabled={!canEdit}
                                                    >
                                                        <option value="">Sin asignar</option>
                                                        {analistas.map(a => (
                                                            <option key={a.user_id} value={a.user_id}>{a.full_name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="dashboard-view">
                    {stats && (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon total">{Icons.table}</div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.total}</span>
                                        <span className="stat-label">Total Requisiciones</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon process">{Icons.chart}</div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.enProceso}</span>
                                        <span className="stat-label">En Proceso</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon closed">{Icons.close}</div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.cerradas}</span>
                                        <span className="stat-label">Cerradas</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon rejected">{Icons.close}</div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.rechazadas}</span>
                                        <span className="stat-label">Rechazadas</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">Cumplimiento Promedio</span>
                                    </div>
                                    <div className="metric-value">{stats.cumplimiento ?? 0}%</div>
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-fill"
                                            style={{ 
                                                width: `${Math.min(stats.cumplimiento ?? 0, 100)}%`,
                                                backgroundColor: stats.cumplimiento >= 80 ? '#10b981' : 
                                                                  stats.cumplimiento >= 60 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">Mora Promedio</span>
                                    </div>
                                    <div className="metric-value">{stats.moraPromedio ?? 0} días</div>
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-fill mora"
                                            style={{ 
                                                width: `${Math.min(((stats.moraPromedio ?? 0) / 30) * 100, 100)}%`,
                                                backgroundColor: stats.moraPromedio > 10 ? '#ef4444' : '#10b981'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">Total Recursos Solicitados</span>
                                    </div>
                                    <div className="metric-value">{(stats.recursos ?? 0).toLocaleString('es-CO')}</div>
                                </div>
                            </div>
                            
                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3>Distribución por Estado</h3>
                                    {estadisticas && Object.keys(estadisticas.porEstado).length > 0 ? (
                                        <div className="chart-container">
                                            <Bar
                                                data={{
                                                    labels: Object.keys(estadisticas.porEstado),
                                                    datasets: [{
                                                        label: 'Cantidad',
                                                        data: Object.values(estadisticas.porEstado),
                                                        backgroundColor: Object.keys(estadisticas.porEstado).map(estado => getEstadoColor(estado)),
                                                        borderRadius: 6,
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: { stepSize: 1 }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="no-data">Sin datos disponibles</div>
                                    )}
                                </div>
                                
                                <div className="chart-card">
                                    <h3>Porcentaje por Estado</h3>
                                    {estadisticas && Object.keys(estadisticas.porEstado).length > 0 ? (
                                        <div className="chart-container doughnut">
                                            <Doughnut
                                                data={{
                                                    labels: Object.keys(estadisticas.porEstado),
                                                    datasets: [{
                                                        data: Object.values(estadisticas.porEstado),
                                                        backgroundColor: Object.keys(estadisticas.porEstado).map(estado => getEstadoColor(estado)),
                                                        borderWidth: 2,
                                                        borderColor: '#fff',
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'right',
                                                            labels: {
                                                                boxWidth: 12,
                                                                padding: 15
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="no-data">Sin datos disponibles</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {showModal && selectedReq && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{selectedReq.codigo_req} - {selectedReq.cargo}</h2>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                    {selectedReq.cliente} | {selectedReq.regional}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                {Icons.close}
                            </button>
                        </div>

                        <div className="tabs-navigation">
                            <button 
                                className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                Información General
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'candidatos' ? 'active' : ''}`}
                                onClick={() => setActiveTab('candidatos')}
                            >
                                Candidatos ({candidatos.length})
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                                onClick={() => setActiveTab('historial')}
                            >
                                Historial y Trazabilidad
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {activeTab === 'general' && (
                                <>
                                    <div className="detail-section">
                                        <h3>Información de la Requisición</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>N° Requisición</label>
                                                <span>{selectedReq.codigo_req}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Fecha de Llegada</label>
                                                <span>{formatDate(selectedReq.fecha_llegada)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Mes</label>
                                                <span>{selectedReq.mes || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Estado Actual</label>
                                                <span className="estado-tag" style={{ backgroundColor: getEstadoColor(selectedReq.estado) }}>
                                                    {selectedReq.estado}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="detail-section">
                                        <h3>Datos del Cliente y Ubicación</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Empresa</label>
                                                <span>{selectedReq.empresa || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Cliente</label>
                                                <span>{selectedReq.cliente || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Regional</label>
                                                <span>{selectedReq.regional || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Ciudad / Oficina</label>
                                                <span>{selectedReq.ciudad} - {selectedReq.oficina}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="detail-section">
                                        <h3>Especificaciones</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Cargo</label>
                                                <span>{selectedReq.cargo}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Vacantes</label>
                                                <span>{selectedReq.cantidad}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Tipo de Contrato</label>
                                                <span>{selectedReq.tipo_contrato || 'No definido'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <label>Solicitante</label>
                                                <span>{selectedReq.solicitante_nombre || '-'}</span>
                                            </div>
                                        </div>
                                        <div className="detail-full">
                                            <label>Justificación / Detalle</label>
                                            <p>{selectedReq.justificacion || 'Sin justificación'}</p>
                                            {selectedReq.detalle && <p style={{ marginTop: '0.5rem' }}>{selectedReq.detalle}</p>}
                                        </div>
                                    </div>

                                    {(selectedReq.hoja_vida_path || selectedReq.aprobacion_path) && (
                                        <div className="detail-section">
                                            <h3>Documentos</h3>
                                            <div className="documents-list">
                                                {selectedReq.hoja_vida_path && (
                                                    <div className="document-item">
                                                        <span className="doc-icon">{Icons.file}</span>
                                                        <span className="doc-name">Perfil / Hoja de Vida</span>
                                                        <button className="doc-btn">{Icons.eye} Ver</button>
                                                    </div>
                                                )}
                                                {selectedReq.aprobacion_path && (
                                                    <div className="document-item">
                                                        <span className="doc-icon">{Icons.file}</span>
                                                        <span className="doc-name">Aprobación Presupuesto</span>
                                                        <button className="doc-btn">{Icons.eye} Ver</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'candidatos' && (
                                <div className="candidates-view">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0 }}>Candidatos Postulados</h3>
                                        {!showCandidateForm && (
                                            <button 
                                                className="btn-export" 
                                                style={{ padding: '0.4rem 0.8rem' }}
                                                onClick={() => setShowCandidateForm(true)}
                                            >
                                                + Añadir Candidato
                                            </button>
                                        )}
                                    </div>
                                    
                                    {showCandidateForm ? (
                                        <form className="candidate-form" onSubmit={handleSubmitCandidato} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                            <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Nuevo Candidato</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Nombre Completo*</label>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        className="filter-select" 
                                                        style={{ width: '100%' }}
                                                        value={candidateData.nombre_candidato}
                                                        onChange={(e) => setCandidateData({...candidateData, nombre_candidato: e.target.value})}
                                                    />
                                                </div>
                                                <div className="detail-item">
                                                    <label>Cédula</label>
                                                    <input 
                                                        type="text" 
                                                        className="filter-select" 
                                                        style={{ width: '100%' }}
                                                        value={candidateData.cedula}
                                                        onChange={(e) => setCandidateData({...candidateData, cedula: e.target.value})}
                                                    />
                                                </div>
                                                <div className="detail-item">
                                                    <label>Teléfono</label>
                                                    <input 
                                                        type="text" 
                                                        className="filter-select" 
                                                        style={{ width: '100%' }}
                                                        value={candidateData.telefono}
                                                        onChange={(e) => setCandidateData({...candidateData, telefono: e.target.value})}
                                                    />
                                                </div>
                                                <div className="detail-item">
                                                    <label>Correo Electrónico</label>
                                                    <input 
                                                        type="email" 
                                                        className="filter-select" 
                                                        style={{ width: '100%' }}
                                                        value={candidateData.correo}
                                                        onChange={(e) => setCandidateData({...candidateData, correo: e.target.value})}
                                                    />
                                                </div>
                                                <div className="detail-item">
                                                    <label>Estado Inicial</label>
                                                    <select 
                                                        className="filter-select" 
                                                        style={{ width: '100%' }}
                                                        value={candidateData.estado}
                                                        onChange={(e) => setCandidateData({...candidateData, estado: e.target.value})}
                                                    >
                                                        <option>Enviado a Selección</option>
                                                        <option>Citado a Entrevista</option>
                                                        <option>En Pruebas</option>
                                                        <option>Finalista</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                                <button type="button" className="doc-btn" onClick={() => setShowCandidateForm(false)}>Cancelar</button>
                                                <button type="submit" className="btn-export">Guardar Candidato</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            {loadingDetails ? (
                                                <p>Cargando candidatos...</p>
                                            ) : candidatos.length === 0 ? (
                                                <div className="no-data">No hay candidatos registrados para esta requisición.</div>
                                            ) : (
                                                <div className="candidates-grid">
                                                    {candidatos.map(cand => (
                                                        <div key={cand.id} className="candidate-card">
                                                            <span className="candidate-name">{cand.nombre_candidato}</span>
                                                            <div className="candidate-info">
                                                                <span><strong>Cédula:</strong> {cand.cedula || 'N/A'}</span>
                                                                <span><strong>Teléfono:</strong> {cand.telefono || 'N/A'}</span>
                                                                <span><strong>Estado:</strong> <span style={{ color: '#2563eb', fontWeight: 600 }}>{cand.estado}</span></span>
                                                            </div>
                                                            <div className="candidate-actions">
                                                                <button className="doc-btn">Perfil</button>
                                                                <button className="doc-btn">Entrevista</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'historial' && (
                                <div className="history-view">
                                    <h3>Línea de Tiempo de Gestión</h3>
                                    {loadingDetails ? (
                                        <p>Cargando historial...</p>
                                    ) : historial.length === 0 ? (
                                        <div className="no-data">No hay registros de actividad.</div>
                                    ) : (
                                        <div className="history-timeline">
                                            {historial.map(item => (
                                                <div key={item.id} className="history-item">
                                                    <div className="history-icon">
                                                        <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }} />
                                                    </div>
                                                    <div className="history-content">
                                                        <div className="history-header">
                                                            <span className="history-action">{item.accion}</span>
                                                            <span className="history-date">{new Date(item.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="history-desc">{item.observacion}</p>
                                                        <span className="history-user">Realizado por: {item.user_nombre}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionRequisiciones;