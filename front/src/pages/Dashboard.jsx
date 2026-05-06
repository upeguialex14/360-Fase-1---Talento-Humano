/**
 * Página de Dashboard General
 * Panel principal del sistema con estética premium
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalWorkers: 0,
        activeWorkers: 0,
        inactiveWorkers: 0,
        companiesCount: 0,
        excelLoads: 4, // Mock until we have history
    });
    const [loading, setLoading] = useState(true);
    const [cargas, setCargas] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/etl/base-datos');
            
            if (response && response.success) {
                const workers = response.data || [];
                const active = workers.filter(w => w.estado?.toLowerCase() === 'activo').length;
                const inactive = workers.length - active;
                
                // Extract unique companies
                const companies = [...new Set(workers.map(w => w.empresa).filter(Boolean))];
                
                setStats({
                    totalWorkers: workers.length,
                    activeWorkers: active,
                    inactiveWorkers: inactive,
                    companiesCount: companies.length,
                    excelLoads: 12, // Mocked for now
                });

                // Mocking some chart data based on real data
                // This could be improved with real grouping from backend
            }

            // Mocked cargas excel for the table
            setCargas([
                { date: new Date().toLocaleDateString(), user: 'admin', records: 156, status: 'Completado' },
                { date: '2026-04-28', user: 'system', records: 42, status: 'Completado' },
                { date: '2026-04-25', user: 'admin', records: 89, status: 'Completado' },
                { date: '2026-04-20', user: 'maria_th', records: 210, status: 'Error' },
            ]);

        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { title: 'Total Trabajadores', value: stats.totalWorkers, icon: '👥', trend: '+12%', up: true },
        { title: 'Activos', value: stats.activeWorkers, icon: '✅', trend: '+5%', up: true },
        { title: 'Inactivos', value: stats.inactiveWorkers, icon: '⛔', trend: '-2%', up: false },
        { title: 'Aliados/Empresas', value: stats.companiesCount, icon: '🏢', trend: '+1', up: true },
        { title: 'Cargas Realizadas', value: stats.excelLoads, icon: '📊', trend: 'Hoy', up: true },
    ];

    return (
        <div className="dashboard-page">
            <header className="dashboard-header mb-8">
                <h1 className="font-display text-neon-green text-4xl font-bold uppercase tracking-wider mb-2">Dashboard General</h1>
                <p className="font-body text-[rgba(248,248,255,0.7)] text-lg">Bienvenido al centro de inteligencia de Talento Humano 360.</p>
            </header>

            <div className="cards-grid">
                {cards.map((card, idx) => (
                    <div key={idx} className="stat-card hologram-panel font-body relative overflow-hidden" style={{ animationDelay: `${idx * 0.1}s`, animation: 'fadeInUp 0.6s ease-out both' }}>
                        <div className="card-icon-wrapper text-3xl mb-3">{card.icon}</div>
                        <div className="card-info">
                            <span className="card-title text-sm text-[rgba(255,255,255,0.7)] uppercase tracking-widest">{card.title}</span>
                            <span className="card-value font-display text-3xl font-bold text-white my-1 block">{loading ? '...' : card.value}</span>
                            <div className={`card-trend ${card.up ? 'trend-up' : 'trend-down'}`}>
                                <span>{card.up ? '↗' : '↘'} {card.trend}</span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>vs mes anterior</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                <div className="chart-card hologram-panel font-body">
                    <h3 className="font-display text-xl text-neon-green mb-4">📈 Evolución Mensual</h3>
                    <div className="chart-container">
                        {/* Custom Bar Chart */}
                        <div className="bar-chart">
                            {[40, 65, 55, 85, 70, 95].map((h, i) => (
                                <div key={i} className="bar-item">
                                    <div className="bar-fill" style={{ height: `${h}%` }}>
                                        <span className="bar-label">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'][i]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="chart-card hologram-panel font-body">
                    <h3 className="font-display text-xl text-neon-green mb-4">🎯 Distribución por Área</h3>
                    <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Simple CSS Circular Chart */}
                        <div style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            background: 'conic-gradient(#FFCD04 0% 45%, #2A2A54 45% 75%, #4ade80 75% 100%)',
                            position: 'relative',
                            boxShadow: '0 0 30px rgba(255, 205, 4, 0.2)'
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: '25px',
                                background: '#0b0f1a',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column'
                            }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.totalWorkers}</span>
                                <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>TOTAL</span>
                            </div>
                        </div>
                        <div style={{ marginLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#FFCD04', borderRadius: '3px' }} /> <span>Operaciones</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#2A2A54', borderRadius: '3px' }} /> <span>Administración</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '3px' }} /> <span>Otros</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-card hologram-panel font-body mt-8">
                <h3 className="font-display text-xl text-neon-green mb-4">📋 Últimas Cargas de Excel</h3>
                <div className="custom-table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th>Registros</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargas.map((carga, i) => (
                                <tr key={i}>
                                    <td>{carga.date}</td>
                                    <td>{carga.user}</td>
                                    <td>{carga.records}</td>
                                    <td>
                                        <span className={`status-badge ${carga.status === 'Completado' ? 'status-completed' : 'status-error'}`}>
                                            {carga.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
