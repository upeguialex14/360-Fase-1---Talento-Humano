import React, { useEffect, useState } from 'react';
import useDotacion from '../hooks/useDotacion';
import dotacionService from '../services/dotacionService';
import '../styles/Dotacion.css';

const DotacionDashboard = () => {
    const { loading, error } = useDotacion();
    const [stats, setStats] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const year = new Date().getFullYear();
            const [statsRes, lowStockRes, invRes] = await Promise.all([
                dotacionService.getDashboardStats(year, 1),
                dotacionService.getLowStock(),
                dotacionService.getInventory()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (lowStockRes.success) setLowStock(lowStockRes.data || []);
            if (invRes.success) setInventory(invRes.data || []);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    };

    const handleUploadInventory = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            // El backend ya tiene una ruta para esto /api/etl/upload/DOTACION
            // Usamos el axios de dotacionService o el global
            const response = await dotacionService.uploadInventoryExcel(formData);
            if (response.success) {
                alert('¡Inventario cargado exitosamente!');
                loadData();
            } else {
                alert('Error al cargar: ' + response.message);
            }
        } catch (err) {
            alert('Error de conexión al subir archivo');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading && !stats) return <div className="dot-container">Cargando dashboard...</div>;

    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'eligible'

    return (
        <div className="dot-container">
            <header className="dot-header">
                <div>
                    <h1>Módulo de Dotación</h1>
                    <p style={{ color: 'var(--dot-text-muted)' }}>Periodo Actual: <b style={{ color: 'var(--dot-primary)' }}>{stats?.eligibility?.period?.name || 'Cargando...'} {stats?.eligibility?.period?.year}</b></p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleUploadInventory} 
                        accept=".xlsx,.xls"
                    />
                    <button 
                        className="dot-btn dot-btn-ghost" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        {uploading ? '⌛ Subiendo...' : '📥 Cargar Inventario'}
                    </button>
                    <button className="dot-btn dot-btn-ghost" onClick={loadData}>🔄 Actualizar</button>
                    <button className="dot-btn dot-btn-primary">✨ Nuevo Plan Anual</button>
                </div>
            </header>

            {/* Grid de Estadísticas */}
            <div className="dot-stats-grid">
                <div className="dot-stat-card">
                    <span className="dot-stat-label">👥 Total Elegibles</span>
                    <div className="dot-stat-value">{stats?.eligibility?.total_eligible || 0}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--dot-text-muted)', marginTop: '0.5rem' }}>Personal pendiente este periodo</p>
                </div>
                <div className="dot-stat-card">
                    <span className="dot-stat-label">✍️ Firmas Pendientes</span>
                    <div className="dot-stat-value" style={{ color: 'var(--dot-accent)' }}>
                        {stats?.eligibility?.total_pending_signature || 0}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--dot-text-muted)', marginTop: '0.5rem' }}>Links enviados sin firmar</p>
                </div>
                <div className="dot-stat-card">
                    <span className="dot-stat-label">⚠️ Alertas de Stock</span>
                    <div className="dot-stat-value" style={{ color: 'var(--dot-danger)' }}>
                        {lowStock.length}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--dot-danger)', marginTop: '0.5rem' }}>Requieren atención inmediata</p>
                </div>
                <div className="dot-stat-card">
                    <span className="dot-stat-label">📅 Próximo Periodo</span>
                    <div className="dot-stat-value">
                        {stats?.eligibility?.next_period?.name || 'Abril'}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--dot-text-muted)', marginTop: '0.5rem' }}>Proyectado para {stats?.eligibility?.next_period?.year || 2026}</p>
                </div>
            </div>

            {/* Tabs para cambiar vista */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--dot-border)' }}>
                <button 
                    onClick={() => setActiveTab('inventory')}
                    style={{ 
                        padding: '1rem', 
                        background: 'none', 
                        border: 'none', 
                        color: activeTab === 'inventory' ? 'var(--dot-primary)' : 'var(--dot-text-muted)',
                        borderBottom: activeTab === 'inventory' ? '2px solid var(--dot-primary)' : 'none',
                        cursor: 'pointer',
                        fontWeight: 700
                    }}
                >
                    📦 Stock e Inventario
                </button>
                <button 
                    onClick={() => setActiveTab('eligible')}
                    style={{ 
                        padding: '1rem', 
                        background: 'none', 
                        border: 'none', 
                        color: activeTab === 'eligible' ? 'var(--dot-primary)' : 'var(--dot-text-muted)',
                        borderBottom: activeTab === 'eligible' ? '2px solid var(--dot-primary)' : 'none',
                        cursor: 'pointer',
                        fontWeight: 700
                    }}
                >
                    👤 Personal Elegible ({stats?.eligibility?.total_eligible || 0})
                </button>
            </div>

            <div className="dot-main-grid">
                {activeTab === 'inventory' ? (
                    <>
                        {/* Tabla de Inventario Principal */}
                        <div className="dot-panel">
                            <div className="dot-panel-header">
                                <h2 className="dot-panel-title">Estado de Inventario</h2>
                                <button className="dot-btn dot-btn-ghost" style={{ fontSize: '0.8rem' }}>Ver Historial Movimientos</button>
                            </div>
                            <div className="dot-table-container">
                                <table className="dot-table">
                                    <thead>
                                        <tr>
                                            <th>Prenda / Artículo</th>
                                            <th>Talla</th>
                                            <th>Stock Disponible</th>
                                            <th>Nivel</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--dot-text-muted)' }}>
                                                    No hay datos de inventario. Suba un Excel con las columnas: PRENDA, TALLA, CANTIDAD.
                                                </td>
                                            </tr>
                                        ) : (
                                            inventory.slice(0, 10).map((item, index) => {
                                                const isLow = item.quantity_available <= (item.min_stock_alert || 5);
                                                const percent = Math.min((item.quantity_available / 50) * 100, 100);
                                                return (
                                                    <tr key={index}>
                                                        <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                                                        <td><span className="dot-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>{item.size}</span></td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                {item?.quantity_available ?? 0}
                                                                <div className="stock-bar-bg" style={{ width: '60px', marginTop: 0 }}>
                                                                    <div className="stock-bar-fill" style={{ 
                                                                        width: `${percent}%`,
                                                                        backgroundColor: isLow ? 'var(--dot-danger)' : 'var(--dot-success)'
                                                                    }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`dot-badge ${isLow ? 'dot-badge-low' : 'dot-badge-ok'}`}>
                                                                {isLow ? 'REABASTECER' : 'ÓPTIMO'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button className="dot-btn dot-btn-ghost" style={{ padding: '0.3rem 0.6rem' }}>📝 Ajustar</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Panel Lateral de Alertas Críticas */}
                        <div className="dot-panel">
                            <div className="dot-panel-header">
                                <h2 className="dot-panel-title">Alertas Críticas</h2>
                                <span className="dot-badge dot-badge-low">{lowStock.length}</span>
                            </div>
                            <div className="dot-alerts-list">
                                {lowStock.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉</div>
                                        <p style={{ color: 'var(--dot-text-muted)' }}>¡Excelente! No hay faltantes de stock reportados.</p>
                                    </div>
                                ) : (
                                    lowStock.map((alert, idx) => (
                                        <div key={idx} className="dot-alert-item">
                                            <div className="dot-alert-info">
                                                <h4>{alert.item_name}</h4>
                                                <p>Talla: {alert.size} | Stock: <b style={{ color: 'var(--dot-danger)' }}>{alert.quantity_available}</b></p>
                                            </div>
                                            <button className="dot-btn dot-btn-primary" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                                                🛒 Ordenar
                                            </button>
                                        </div>
                                    ))
                                )}
                                
                                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '1rem', border: '1px dashed rgba(56, 189, 248, 0.2)' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--dot-accent)' }}>💡 Tip de Gestión</h4>
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--dot-text-muted)' }}>
                                        Puede configurar los umbrales mínimos de stock para cada prenda en el botón de Configuración.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Vista de Personal Elegible */
                    <div className="dot-panel" style={{ gridColumn: 'span 2' }}>
                        <div className="dot-panel-header">
                            <h2 className="dot-panel-title">Personal que califica para Dotación ({stats?.eligibility?.period?.name})</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="dot-btn dot-btn-ghost">📥 Exportar Listado</button>
                                <button className="dot-btn dot-btn-primary">📧 Enviar Links de Firma a Todos</button>
                            </div>
                        </div>
                        <div className="dot-table-container">
                            <table className="dot-table">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Cédula</th>
                                        <th>Unidad de Negocio</th>
                                        <th>Fecha Ingreso</th>
                                        <th>Tallas (C/P/Z)</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.eligibility?.people_list?.length > 0 ? (
                                        stats.eligibility.people_list.map((person, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 600 }}>{person.nombre_completo}</td>
                                                <td>{person.cedula}</td>
                                                <td>{person.unidad}</td>
                                                <td>{person.fecha_ingreso ? new Date(person.fecha_ingreso).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                        <span className="dot-badge" title="Camisa">{person.talla_camisa || '-'}</span>
                                                        <span className="dot-badge" title="Pantalon">{person.talla_pantalon || '-'}</span>
                                                        <span className="dot-badge" title="Zapatos">{person.talla_zapatos || '-'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="dot-badge dot-badge-ok">ELEGIBLE</span>
                                                </td>
                                                <td>
                                                    <button className="dot-btn dot-btn-ghost" style={{ padding: '0.3rem' }}>📩 Link</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--dot-text-muted)' }}>
                                                No se encontraron empleados elegibles para este periodo.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DotacionDashboard;
