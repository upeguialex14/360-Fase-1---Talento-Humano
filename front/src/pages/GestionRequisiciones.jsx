import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './GestionRequisiciones.css';

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
    
    // Estadísticas
    const [estadisticas, setEstadisticas] = useState(null);
    const [analistas, setAnalistas] = useState([]);
    
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

    // Abrir modal de detalles
    const openDetails = (req) => {
        setSelectedReq(req);
        setShowModal(true);
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
        if (!estadisticas) return null;
        
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
            moraPromedio: Math.round(estadisticas.moraPromedio),
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
                    {/* Barra de filtros */}
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

                    {/* Tabla de requisiciones */}
                    <div className="table-container">
                        <table className="requisiciones-table">
                            <thead>
                                <tr>
                                    <th>N° Req</th>
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
                                    <th>Acciones</th>
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
                                                >
                                                    {ESTADOS.filter(e => e.value).map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`mora-badge ${req.dias_mora > 0 ? 'has-mora' : ''}`}>
                                                    {req.dias_mora || 0}
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
                                                    >
                                                        <option value="">Sin asignar</option>
                                                        {analistas.map(a => (
                                                            <option key={a.user_id} value={a.user_id}>{a.full_name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            )}
                                            <td>
                                                <button className="btn-details" onClick={() => openDetails(req)}>
                                                    {Icons.eye}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                /* Vista Dashboard */
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
                                    <div className="metric-value">{stats.cumplimiento}%</div>
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-fill"
                                            style={{ 
                                                width: `${stats.cumplimiento}%`,
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
                                    <div className="metric-value">{stats.moraPromedio} días</div>
                                    <div className="metric-bar">
                                        <div 
                                            className="metric-fill mora"
                                            style={{ 
                                                width: `${Math.min(stats.moraPromedio * 10, 100)}%`,
                                                backgroundColor: stats.moraPromedio > 10 ? '#ef4444' : '#10b981'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-header">
                                        <span className="metric-title">Total Recursos Solicitados</span>
                                    </div>
                                    <div className="metric-value">{stats.recursos}</div>
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

            {/* Modal de Detalles */}
            {showModal && selectedReq && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles de Requisición</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                {Icons.close}
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Información General</h3>
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
                                        <label>Estado</label>
                                        <span className="estado-tag" style={{ backgroundColor: getEstadoColor(selectedReq.estado) }}>
                                            {selectedReq.estado}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="detail-section">
                                <h3>Datos del Cliente</h3>
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
                                        <label>Unidad de Negocio</label>
                                        <span>{selectedReq.unidad_negocio || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Zona</label>
                                        <span>{selectedReq.zona || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Oficina</label>
                                        <span>{selectedReq.oficina || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Ciudad</label>
                                        <span>{selectedReq.ciudad || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="detail-section">
                                <h3>Detalles de la Vacante</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Cargo Solicitado</label>
                                        <span>{selectedReq.cargo}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Cantidad</label>
                                        <span>{selectedReq.cantidad}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Tipo de Contrato</label>
                                        <span>{selectedReq.tipo_contrato || 'Sin asignar'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Justificación</label>
                                        <span>{selectedReq.justificacion || '-'}</span>
                                    </div>
                                </div>
                                <div className="detail-full">
                                    <label>Detalle</label>
                                    <p>{selectedReq.detalle || 'Sin detalle'}</p>
                                </div>
                            </div>
                            
                            <div className="detail-section">
                                <h3>Métricas</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Días Hábiles</label>
                                        <span>{selectedReq.dias_habiles || 0}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Días de Mora</label>
                                        <span className={selectedReq.dias_mora > 0 ? 'text-danger' : ''}>
                                            {selectedReq.dias_mora || 0}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>% Cumplimiento</label>
                                        <span>{selectedReq.porcentaje_cumplimiento || 100}%</span>
                                    </div>
                                    {isAdminOrLider && (
                                        <div className="detail-item">
                                            <label>Analista Asignado</label>
                                            <span>{selectedReq.analista_asignado_nombre || 'Sin asignar'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {(selectedReq.hoja_vida_path || selectedReq.aprobacion_path) && (
                                <div className="detail-section">
                                    <h3>Documentos Adjuntos</h3>
                                    <div className="documents-list">
                                        {selectedReq.hoja_vida_path && (
                                            <div className="document-item">
                                                <span className="doc-icon">{Icons.file}</span>
                                                <span className="doc-name">Hoja de Vida</span>
                                                <button className="doc-btn">{Icons.eye} Ver</button>
                                                <button className="doc-btn">{Icons.downloadFile} Descargar</button>
                                            </div>
                                        )}
                                        {selectedReq.aprobacion_path && (
                                            <div className="document-item">
                                                <span className="doc-icon">{Icons.file}</span>
                                                <span className="doc-name">Aprobación de Recurso</span>
                                                <button className="doc-btn">{Icons.eye} Ver</button>
                                                <button className="doc-btn">{Icons.downloadFile} Descargar</button>
                                            </div>
                                        )}
                                    </div>
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