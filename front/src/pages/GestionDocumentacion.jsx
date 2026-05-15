import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './GestionDocumentacion.css';

const CATEGORIAS = [
    { value: 'all', label: 'Todos los Documentos' },
    { value: 'contratos', label: 'Contratos Laborales' },
    { value: 'seguridad_social', label: 'Seguridad Social' },
    { value: 'identidad', label: 'Documentos Identidad' },
    { value: 'certificaciones', label: 'Certificaciones' },
    { value: 'academicos', label: 'Soportes Académicos' },
    { value: 'otros', label: 'Otros' }
];

const Icons = {
    search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>,
    download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    filter: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
};

const GestionDocumentacion = () => {
    const [vinculaciones, setVinculaciones] = useState([]);
    const [selectedVinculacion, setSelectedVinculacion] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const fetchVinculaciones = async () => {
        setLoading(true);
        try {
            const result = await api.get('/documentacion/vinculaciones');
            if (result.success) {
                setVinculaciones(result.data);
            }
        } catch (error) {
            console.error('Error fetching vinculaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVinculaciones();
    }, []);

    const handleViewDetail = async (id) => {
        try {
            const result = await api.get(`/documentacion/vinculaciones/${id}`);
            if (result.success) {
                setSelectedVinculacion(result.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching detail:', error);
        }
    };

    const filteredList = vinculaciones.filter(v => 
        v.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.identificacion.includes(busqueda)
    );

    const stats = {
        total: vinculaciones.length,
        pendientes: vinculaciones.reduce((acc, curr) => acc + (curr.pendientes > 0 ? 1 : 0), 0),
        completos: vinculaciones.reduce((acc, curr) => acc + (curr.pendientes === 0 ? 1 : 0), 0)
    };

    return (
        <div className="gestion-documentacion">
            <div className="page-header">
                <div className="header-left">
                    <h1>Gestión de Documentación</h1>
                    <p className="page-subtitle">Monitoreo de procesos de vinculación y repositorios de archivos</p>
                </div>
            </div>

            {/* Dashboard de métricas reales */}
            <div className="docs-stats">
                <div className="doc-stat-card">
                    <div className="stat-icon-wrapper total">👤</div>
                    <div className="stat-info">
                        <h3>{stats.total}</h3>
                        <p>Total Vinculaciones</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrapper pending">⏳</div>
                    <div className="stat-info">
                        <h3>{stats.pendientes}</h3>
                        <p>En Revisión</p>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrapper total" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✅</div>
                    <div className="stat-info">
                        <h3>{stats.completos}</h3>
                        <p>Completados</p>
                    </div>
                </div>
            </div>

            {/* Controles */}
            <div className="docs-controls">
                <div className="search-wrapper">
                    <i>{Icons.search}</i>
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o cédula..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {/* Grilla de Personas */}
            {loading ? (
                <div className="no-data">Cargando base de datos de vinculación...</div>
            ) : filteredList.length === 0 ? (
                <div className="no-data">No se han registrado vinculaciones aún.</div>
            ) : (
                <div className="docs-grid">
                    {filteredList.map(v => (
                        <div key={v.id} className="doc-card">
                            <div className="doc-card-header">
                                <span className={`doc-type-badge ${v.pendientes > 0 ? 'badge-orange' : 'badge-green'}`}>
                                    {v.pendientes > 0 ? 'En Revisión' : 'Verificado'}
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    {new Date(v.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="doc-card-body">
                                <h4>{v.nombre_completo}</h4>
                                <p>Cédula: {v.identificacion} • {v.ciudad}</p>
                            </div>
                            <div className="doc-employee-info">
                                <span className="employee-name" style={{ marginLeft: 0 }}>
                                    📦 {v.total_documentos} documentos cargados
                                </span>
                            </div>
                            <div className="doc-card-footer">
                                <button className="btn-doc-action primary" style={{ width: '100%' }} onClick={() => handleViewDetail(v.id)}>
                                    {Icons.eye}
                                    Gestionar Documentos
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Modal de Detalle */}
            {showDetailModal && selectedVinculacion && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <div>
                                <h2>Expediente: {selectedVinculacion.nombre_completo}</h2>
                                <p style={{ color: '#94a3b8', margin: 0 }}>ID: {selectedVinculacion.identificacion} • {selectedVinculacion.correo}</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="docs-table-wrapper">
                                <table className="vinculacion-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Documento</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedVinculacion.documentos.map(doc => (
                                            <tr key={doc.id}>
                                                <td><span className="item-code">{doc.codigo_documento}</span></td>
                                                <td style={{ fontWeight: 600 }}>{doc.nombre_documento}</td>
                                                <td>
                                                    <span className={`doc-type-badge ${doc.estado === 'Verificado' ? 'badge-green' : 'badge-orange'}`}>
                                                        {doc.estado}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <a 
                                                            href={`http://localhost:3000/${doc.archivo_path.replace(/\\/g, '/')}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="btn-doc-action"
                                                            style={{ padding: '0.4rem 0.8rem' }}
                                                        >
                                                            {Icons.eye} Ver
                                                        </a>
                                                        <a 
                                                            href={`http://localhost:3000/${doc.archivo_path.replace(/\\/g, '/')}`} 
                                                            download
                                                            className="btn-doc-action primary"
                                                            style={{ padding: '0.4rem 0.8rem' }}
                                                        >
                                                            {Icons.download}
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionDocumentacion;
