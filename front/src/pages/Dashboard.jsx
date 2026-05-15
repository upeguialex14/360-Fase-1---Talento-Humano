import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Users, 
    FileText, 
    Target, 
    Package, 
    Factory, 
    TrendingUp, 
    Activity, 
    Building2,
    Clock
} from 'lucide-react';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title,
    PointElement,
    LineElement,
    Filler
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/main-dashboard/stats');
            if (response && response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error("Error loading dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="dashboard-loading">
                <div className="loader-ring"><div></div><div></div><div></div><div></div></div>
                <p>Sincronizando Sistema Nexus 360...</p>
            </div>
        );
    }

    const cards = [
        { 
            title: 'Talento Humano', 
            value: stats.empleados.total, 
            subtitle: `${stats.empleados.activos} Colaboradores Activos`,
            icon: <Users size={24} />, 
            color: 'blue',
            badge: `${stats.empleados.empresas} Empresas`
        },
        { 
            title: 'Vinculaciones', 
            value: stats.vinculaciones.total, 
            subtitle: `${stats.vinculaciones.pendientes} En revisión técnica`,
            icon: <FileText size={24} />, 
            color: 'orange',
            badge: 'Fase de Ingreso'
        },
        { 
            title: 'Vacantes Activas', 
            value: (stats.requisiciones.recibido || 0) + (stats.requisiciones.en_proceso || 0), 
            subtitle: `${stats.requisiciones.completado || 0} Cubiertas este periodo`,
            icon: <Target size={24} />, 
            color: 'green',
            badge: 'Reclutamiento'
        },
        { 
            title: 'Inventario Dotación', 
            value: stats.dotacion.stock_total, 
            subtitle: `${stats.dotacion.entregas_pendientes} Pendientes de entrega`,
            icon: <Package size={24} />, 
            color: 'purple',
            badge: 'Logística'
        },
        { 
            title: 'Personal Planta', 
            value: stats.planta.total, 
            subtitle: 'Operación en sitio',
            icon: <Factory size={24} />, 
            color: 'cyan',
            badge: 'Planta'
        }
    ];

    // Chart Data for Requisitions
    const barData = {
        labels: Object.keys(stats.requisiciones).filter(k => k !== 'total').map(k => k.replace(/_/g, ' ').toUpperCase()),
        datasets: [{
            label: 'Requisiciones por Estado',
            data: Object.entries(stats.requisiciones).filter(([k]) => k !== 'total').map(([,v]) => v),
            backgroundColor: 'rgba(0, 230, 89, 0.4)',
            borderColor: '#00e659',
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: 'rgba(0, 230, 89, 0.6)',
        }]
    };

    const doughnutData = {
        labels: ['Completados', 'Pendientes'],
        datasets: [{
            data: [stats.vinculaciones.completados, stats.vinculaciones.pendientes],
            backgroundColor: ['rgba(0, 230, 89, 0.6)', 'rgba(255, 145, 0, 0.4)'],
            borderColor: ['#00e659', '#ff9100'],
            borderWidth: 1,
            hoverOffset: 10
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)' }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.5)' }
            }
        }
    };

    return (
        <div className="dashboard-page custom-scrollbar">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="status-indicator">
                        <span className="pulse"></span>
                        LIVE SYSTEM MONITORING
                    </div>
                    <h1>Centro de Inteligencia <span>360</span></h1>
                    <p>Visualización analítica de procesos operativos y estratégicos.</p>
                </div>
                <div className="header-right">
                    <div className="date-display">
                        <Clock size={16} />
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                {cards.map((card, idx) => (
                    <div key={idx} className={`glass-card stat-item ${card.color}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="card-top">
                            <div className="icon-box">{card.icon}</div>
                            <span className="card-badge">{card.badge}</span>
                        </div>
                        <div className="card-main">
                            <h3>{card.title}</h3>
                            <div className="value-row">
                                <span className="main-value">{card.value}</span>
                                <TrendingUp size={16} className="trend-icon" />
                            </div>
                            <p className="subtitle">{card.subtitle}</p>
                        </div>
                        <div className="card-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="visual-section mt-8">
                <div className="glass-card chart-container">
                    <div className="chart-header">
                        <Activity size={20} className="text-neon-green" />
                        <h3>Distribución de Requisiciones</h3>
                    </div>
                    <div className="chart-body">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass-card chart-container doughnut-section">
                    <div className="chart-header">
                        <Building2 size={20} className="text-orange-400" />
                        <h3>Efectividad de Vinculación</h3>
                    </div>
                    <div className="chart-body doughnut-wrap">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)' } } } }} />
                    </div>
                </div>
            </div>

            <footer className="dashboard-footer mt-8">
                <div className="footer-card glass-card">
                    <div className="footer-icon blue"><Building2 /></div>
                    <div className="footer-text">
                        <h4>{stats.empleados.empresas}</h4>
                        <p>Empresas Aliadas</p>
                    </div>
                </div>
                <div className="footer-card glass-card">
                    <div className="footer-icon purple"><Package /></div>
                    <div className="footer-text">
                        <h4>{stats.dotacion.stock_total}</h4>
                        <p>Ítems en Inventario</p>
                    </div>
                </div>
                <div className="footer-card glass-card">
                    <div className="footer-icon green"><Activity /></div>
                    <div className="footer-text">
                        <h4>Real-Time</h4>
                        <p>Sincronización Activa</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
