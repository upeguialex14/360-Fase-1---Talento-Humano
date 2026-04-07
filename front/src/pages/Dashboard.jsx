/**
 * Página de Dashboard General
 * Panel principal del sistema
 */
import React, { useState, useEffect } from 'react';

// Dashboard General page with mock data
const Dashboard = () => {
    // state hooks for each section
    const [cards, setCards] = useState([]);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [cardsError, setCardsError] = useState(null);

    const [evolucion, setEvolucion] = useState([]);
    const [evolucionLoading, setEvolucionLoading] = useState(true);
    const [evolucionError, setEvolucionError] = useState(null);

    const [distribucion, setDistribucion] = useState([]);
    const [distribucionLoading, setDistribucionLoading] = useState(true);
    const [distribucionError, setDistribucionError] = useState(null);

    const [porEmpresa, setPorEmpresa] = useState([]);
    const [porEmpresaLoading, setPorEmpresaLoading] = useState(true);
    const [porEmpresaError, setPorEmpresaError] = useState(null);

    const [cargas, setCargas] = useState([]);
    const [cargasLoading, setCargasLoading] = useState(true);
    const [cargasError, setCargasError] = useState(null);

    // effect to load all mocks once
    useEffect(() => {
        loadCards();
        loadEvolucion();
        loadDistribucion();
        loadTrabajadoresEmpresa();
        loadUltimasCargas();
    }, []);

    async function loadCards() {
        try {
            const data = await getDashboardCards();
            setCards(data);
        } catch (err) {
            setCardsError(err.message || 'Error al cargar tarjetas');
        } finally {
            setCardsLoading(false);
        }
    }

    async function loadEvolucion() {
        try {
            const data = await getEvolucionTrabajadores();
            setEvolucion(data);
        } catch (err) {
            setEvolucionError(err.message || 'Error al cargar evolución');
        } finally {
            setEvolucionLoading(false);
        }
    }

    async function loadDistribucion() {
        try {
            const data = await getDistribucionAusencias();
            setDistribucion(data);
        } catch (err) {
            setDistribucionError(err.message || 'Error al cargar distribución');
        } finally {
            setDistribucionLoading(false);
        }
    }

    async function loadTrabajadoresEmpresa() {
        try {
            const data = await getTrabajadoresPorEmpresa();
            setPorEmpresa(data);
        } catch (err) {
            setPorEmpresaError(err.message || 'Error al cargar empresas');
        } finally {
            setPorEmpresaLoading(false);
        }
    }

    async function loadUltimasCargas() {
        try {
            const data = await getUltimasCargasExcel();
            setCargas(data);
        } catch (err) {
            setCargasError(err.message || 'Error al cargar cargas');
        } finally {
            setCargasLoading(false);
        }
    }

    /**
     * Mock implementations (to be replaced by real API calls in the future)
     */
    async function getDashboardCards() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { title: 'Total trabajadores', value: 1250, icon: '👥', percentage: 5, trendUp: true },
                    { title: 'Trabajadores activos', value: 1100, icon: '✅', percentage: 3, trendUp: true },
                    { title: 'Trabajadores inactivos', value: 150, icon: '⛔', percentage: 1, trendUp: false },
                    { title: 'Empresas registradas', value: 23, icon: '🏢', percentage: 2, trendUp: true },
                    { title: 'Zonas / Áreas', value: 12, icon: '📍', percentage: 0, trendUp: true },
                    { title: 'Ausencias registradas', value: 47, icon: '📅', percentage: 4, trendUp: false },
                    { title: 'Cargas Excel', value: 32, icon: '📄', percentage: 6, trendUp: true },
                    { title: 'Crecimiento (%)', value: 4.5, icon: '📈', percentage: 0.5, trendUp: true }
                ]);
            }, 600);
        });
    }

    async function getEvolucionTrabajadores() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { period: 'Ene', count: 900 },
                    { period: 'Feb', count: 920 },
                    { period: 'Mar', count: 970 },
                    { period: 'Abr', count: 1020 },
                    { period: 'May', count: 1080 },
                    { period: 'Jun', count: 1150 }
                ]);
            }, 800);
        });
    }

    async function getDistribucionAusencias() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { category: 'Enfermedad', value: 20 },
                    { category: 'Vacaciones', value: 15 },
                    { category: 'Permiso', value: 8 },
                    { category: 'Otro', value: 4 }
                ]);
            }, 800);
        });
    }

    async function getTrabajadoresPorEmpresa() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { company: 'Acme SA', count: 400 },
                    { company: 'Talento SRL', count: 320 },
                    { company: 'Empresas XYZ', count: 230 },
                    { company: 'Servicios Global', count: 300 }
                ]);
            }, 800);
        });
    }

    async function getUltimasCargasExcel() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { date: '2026-02-20', user: 'admin', records: 120, status: 'Completado' },
                    { date: '2026-02-15', user: 'maria', records: 85, status: 'Completado' },
                    { date: '2026-02-10', user: 'jose', records: 200, status: 'Error' },
                    { date: '2026-01-30', user: 'luis', records: 160, status: 'Completado' }
                ]);
            }, 800);
        });
    }

    /**
     * Helper components for simple inline charts
     */
    const LineChart = ({ data }) => {
        if (!data.length) return <p>No hay datos</p>;
        const max = Math.max(...data.map((d) => d.count));
        const points = data
            .map((d, i) => `${(i * 100) / (data.length - 1)}%,${100 - (d.count / max) * 100}%`)
            .join(' ');
        return (
            <svg className="chart-svg" viewBox="0 0 100 100">
                <polyline
                    fill="none"
                    stroke="#007bff"
                    strokeWidth="2"
                    points={points}
                />
            </svg>
        );
    };

    const PieChart = ({ data }) => {
        if (!data.length) return <p>No hay datos</p>;
        const total = data.reduce((s, d) => s + d.value, 0);
        let cumulative = 0;
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545'];
        return (
            <svg className="chart-svg" viewBox="0 0 32 32">
                {data.map((d, i) => {
                    const start = (cumulative / total) * 2 * Math.PI;
                    const end = ((cumulative + d.value) / total) * 2 * Math.PI;
                    const x1 = 16 + 16 * Math.cos(start);
                    const y1 = 16 + 16 * Math.sin(start);
                    const x2 = 16 + 16 * Math.cos(end);
                    const y2 = 16 + 16 * Math.sin(end);
                    const large = end - start > Math.PI ? 1 : 0;
                    const path = `M16 16 L${x1} ${y1} A16 16 0 ${large} 1 ${x2} ${y2} Z`;
                    cumulative += d.value;
                    return <path key={i} d={path} fill={colors[i % colors.length]} />;
                })}
            </svg>
        );
    };

    const BarChart = ({ data }) => {
        if (!data.length) return <p>No hay datos</p>;
        const max = Math.max(...data.map((d) => d.count));
        return (
            <div className="bar-chart">
                {data.map((d, i) => (
                    <div
                        key={i}
                        className="bar"
                        style={{ height: `${(d.count / max) * 100}%` }}
                        title={`${d.company}: ${d.count}`}
                    >
                        <span className="bar-label">{d.company}</span>
                    </div>
                ))}
            </div>
        );
    };

    // render
    return (
        <div className="page dashboard-page">
            {/* internal styles */}
            <style>{`
                .dashboard-page { padding: 1rem; }
                .cards-container { display: flex; flex-wrap: wrap; gap: 1rem; }
                .card { flex: 1 1 150px; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
                .card-icon { font-size: 2rem; }
                .card-title { font-size: 0.9rem; color: #555; }
                .card-value { font-size: 1.5rem; font-weight: bold; }
                .card-trend { font-size: 0.8rem; }
                .charts-container { display: flex; flex-wrap: wrap; gap: 2rem; margin-top: 2rem; }
                .chart { flex: 1 1 300px; background: #fff; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
                .chart-svg { width: 100%; height: 150px; }
                .bar-chart { display: flex; align-items: flex-end; height: 120px; gap: 0.5rem; }
                .bar { flex: 1; background: #007bff; position: relative; }
                .bar-label { position: absolute; bottom: -1.2rem; font-size: 0.75rem; white-space: nowrap; transform: rotate(-45deg); transform-origin: bottom left; }
                .table-container { margin-top: 2rem; overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 0.5rem; border: 1px solid #ccc; text-align: left; }
                .error { color: red; }
            `}</style>

            <h1>Dashboard General</h1>
            <p>Bienvenido al panel de control principal del sistema TalentoHumano360</p>

            {/* Cards section */}
            <div className="cards-container">
                {cardsLoading && <p>Cargando tarjetas...</p>}
                {cardsError && <p className="error">{cardsError}</p>}
                {!cardsLoading && !cardsError &&
                    cards.map((c, idx) => (
                        <div key={idx} className="card">
                            <div className="card-icon">{c.icon}</div>
                            <div className="card-title">{c.title}</div>
                            <div className="card-value">{c.value}</div>
                            <div className="card-trend">
                                {c.trendUp ? '↑' : '↓'} {c.percentage}%
                            </div>
                        </div>
                    ))}
            </div>

            {/* Charts section */}
            <div className="charts-container">
                <div className="chart">
                    <h3>Evolución de trabajadores</h3>
                    {evolucionLoading && <p>Cargando...</p>}
                    {evolucionError && <p className="error">{evolucionError}</p>}
                    {!evolucionLoading && !evolucionError && <LineChart data={evolucion} />}
                </div>
                <div className="chart">
                    <h3>Distribución de ausencias</h3>
                    {distribucionLoading && <p>Cargando...</p>}
                    {distribucionError && <p className="error">{distribucionError}</p>}
                    {!distribucionLoading && !distribucionError && <PieChart data={distribucion} />}
                </div>
                <div className="chart">
                    <h3>Trabajadores por empresa</h3>
                    {porEmpresaLoading && <p>Cargando...</p>}
                    {porEmpresaError && <p className="error">{porEmpresaError}</p>}
                    {!porEmpresaLoading && !porEmpresaError && <BarChart data={porEmpresa} />}
                </div>
            </div>

            {/* Table section */}
            <div className="table-container">
                <h3>Últimas cargas de Excel</h3>
                {cargasLoading && <p>Cargando...</p>}
                {cargasError && <p className="error">{cargasError}</p>}
                {!cargasLoading && !cargasError && (
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th>Registros procesados</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargas.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.date}</td>
                                    <td>{r.user}</td>
                                    <td>{r.records}</td>
                                    <td>{r.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
