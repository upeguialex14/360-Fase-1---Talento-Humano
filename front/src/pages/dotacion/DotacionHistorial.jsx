import React, { useState, useEffect, useCallback, useRef } from 'react';
import dotacionService from '../../services/dotacionService';
import {
    Search, User, Package, Calendar, CheckCircle2,
    Clock, XCircle, ChevronRight, RefreshCcw,
    Star, Truck, FileSignature, Shirt, MapPin,
    Building2, Briefcase, BadgeCheck, AlertTriangle
} from 'lucide-react';
import '../../styles/DotacionLiquidEther.css';

// ─── Constantes ─────────────────────────────────────────────────────────────
const PERIOD_LABELS = { 1: 'Abril', 2: 'Agosto', 3: 'Nov-Dic' };
const PERIOD_COLORS = {
    1: { bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.3)', accent: '#38bdf8' },
    2: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.3)', accent: '#a78bfa' },
    3: { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.3)', accent: '#fb923c' }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStatusStyle(statusName) {
    if (!statusName) return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: <Clock size={13} /> };
    const s = statusName.toLowerCase();
    if (s.includes('entregad') || s.includes('completad') || s.includes('firmad'))
        return { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle2 size={13} /> };
    if (s.includes('cancelad') || s.includes('rechazad'))
        return { color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: <XCircle size={13} /> };
    if (s.includes('preparaci') || s.includes('proceso'))
        return { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', icon: <Clock size={13} /> };
    if (s.includes('pendiente') || s.includes('aprobad'))
        return { color: '#FFCD04', bg: 'rgba(255,205,4,0.1)', icon: <Clock size={13} /> };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: <Clock size={13} /> };
}

function fmtDate(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d; }
}

function Stars({ rating }) {
    return (
        <span style={{ display: 'inline-flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={12} fill={n <= rating ? '#FFCD04' : 'none'} color={n <= rating ? '#FFCD04' : '#475569'} />
            ))}
        </span>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────
const DotacionHistorial = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [ledger, setLedger] = useState(null);
    const [loadingLedger, setLoadingLedger] = useState(false);
    const [activeYear, setActiveYear] = useState(new Date().getFullYear());
    const [expandedDelivery, setExpandedDelivery] = useState(null);
    const debounceRef = useRef(null);

    // Carga inicial de todos los colaboradores
    useEffect(() => {
        loadEmployees('');
    }, []);

    const loadEmployees = async (term) => {
        setLoadingList(true);
        try {
            const res = await dotacionService.getEmployeesList(term);
            if (res.success) setEmployees(res.data || []);
        } catch (e) {
            console.error('Error cargando empleados:', e);
        } finally {
            setLoadingList(false);
        }
    };

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadEmployees(value), 350);
    }, []);

    const handleSelectEmployee = async (emp) => {
        setSelectedEmployee(emp);
        setLedger(null);
        setExpandedDelivery(null);
        setLoadingLedger(true);
        try {
            const res = await dotacionService.getEmployeeLedger(emp.people_id);
            if (res.success) {
                setLedger(res.data);
                // Detectar el año más reciente con entregas
                if (res.data.deliveries && res.data.deliveries.length > 0) {
                    setActiveYear(res.data.deliveries[0].period_year);
                }
            }
        } catch (e) {
            console.error('Error cargando historial:', e);
        } finally {
            setLoadingLedger(false);
        }
    };

    // Agrupar entregas por año
    const deliveriesByYear = ledger
        ? ledger.deliveries.reduce((acc, d) => {
            if (!acc[d.period_year]) acc[d.period_year] = {};
            acc[d.period_year][d.period_number] = d;
            return acc;
        }, {})
        : {};
    const years = Object.keys(deliveriesByYear).sort((a, b) => b - a);

    // Encuesta de una entrega
    const getSurveyForDelivery = (deliveryId) => {
        if (!ledger?.surveys) return null;
        return ledger.surveys.find(s => s.delivery_id === deliveryId) || null;
    };

    return (
        <div className="nexus-page-container nexus-scrollbar">
            <div className="nexus-card">
                {/* HEADER */}
                <header className="nexus-header">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1>Historial de Dotación</h1>
                            <p>Ficha individual de prendas entregadas por período anual</p>
                        </div>
                    </div>
                </header>

                {/* LAYOUT: buscador izq + detalle der */}
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', minHeight: '65vh' }}>

                    {/* ── PANEL IZQUIERDO: Lista de colaboradores ── */}
                    <div style={{
                        background: 'rgba(15,19,34,0.5)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Buscador */}
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input
                                    id="historial-search-input"
                                    type="text"
                                    placeholder="Nombre o cédula…"
                                    value={searchTerm}
                                    onChange={e => handleSearch(e.target.value)}
                                    className="nexus-input"
                                    style={{ paddingLeft: '2.4rem', padding: '0.75rem 1rem 0.75rem 2.4rem', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Lista */}
                        <div style={{ overflowY: 'auto', flex: 1 }} className="nexus-scrollbar">
                            {loadingList ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
                                    Buscando colaboradores…
                                </div>
                            ) : employees.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>
                                    Sin resultados
                                </div>
                            ) : employees.map(emp => {
                                const isActive = selectedEmployee?.people_id === emp.people_id;
                                const isActivoPlanta = (emp.estado_planta || emp.status || '').toLowerCase() === 'activo';
                                return (
                                    <button
                                        key={emp.people_id}
                                        id={`emp-item-${emp.people_id}`}
                                        onClick={() => handleSelectEmployee(emp)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.9rem 1.25rem', cursor: 'pointer', border: 'none',
                                            borderLeft: isActive ? '3px solid #FFCD04' : '3px solid transparent',
                                            background: isActive ? 'rgba(255,205,4,0.07)' : 'transparent',
                                            transition: 'all 0.2s',
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {/* Avatar */}
                                        <div style={{
                                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                            background: isActive ? 'rgba(255,205,4,0.15)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${isActive ? 'rgba(255,205,4,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={16} color={isActive ? '#FFCD04' : '#475569'} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '0.82rem', fontWeight: 700, color: isActive ? '#FFCD04' : '#e2e8f0',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                            }}>
                                                {emp.nombre_completo}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                                                {emp.cedula}
                                                {emp.unit_name && ` · ${emp.unit_name}`}
                                            </div>
                                        </div>
                                        {/* Estado */}
                                        <span style={{
                                            fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 99,
                                            flexShrink: 0, textTransform: 'uppercase', letterSpacing: 0.5,
                                            background: isActivoPlanta ? 'rgba(74,222,128,0.1)' : 'rgba(148,163,184,0.1)',
                                            color: isActivoPlanta ? '#4ade80' : '#94a3b8'
                                        }}>
                                            {isActivoPlanta ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Contador */}
                        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#475569' }}>
                            {employees.length} colaborador{employees.length !== 1 ? 'es' : ''} encontrado{employees.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* ── PANEL DERECHO: Detalle / Historial ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                        {!selectedEmployee ? (
                            /* Estado vacío */
                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20, padding: '4rem',
                                color: '#334155', textAlign: 'center'
                            }}>
                                <Package size={52} strokeWidth={1} style={{ marginBottom: '1.5rem', color: '#1e293b' }} />
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                                    Selecciona un colaborador
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                                    Elige un nombre en el panel izquierdo para ver su historial de dotación
                                </div>
                            </div>
                        ) : loadingLedger ? (
                            <div style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20
                            }}>
                                <div style={{ textAlign: 'center', color: '#475569' }}>
                                    <RefreshCcw size={28} className="spin-anim" style={{ marginBottom: 12, opacity: 0.5 }} />
                                    <div style={{ fontSize: '0.9rem' }}>Cargando historial…</div>
                                </div>
                            </div>
                        ) : ledger ? (
                            <>
                                {/* ── Tarjeta de Perfil ── */}
                                <div style={{
                                    background: 'rgba(15,19,34,0.5)', border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 20, padding: '1.75rem', position: 'relative', overflow: 'hidden'
                                }}>
                                    {/* Acento top */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #FFCD04, transparent)' }} />

                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        {/* Avatar grande */}
                                        <div style={{
                                            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                                            background: 'rgba(255,205,4,0.1)', border: '2px solid rgba(255,205,4,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={28} color="#FFCD04" />
                                        </div>

                                        {/* Datos básicos */}
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFCD04', marginBottom: 4 }}>
                                                {ledger.profile.nombre_completo}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                <InfoChip icon={<BadgeCheck size={13} />} label={ledger.profile.cedula} />
                                                {ledger.profile.cargo && <InfoChip icon={<Briefcase size={13} />} label={ledger.profile.cargo} />}
                                                {ledger.profile.unit_name && <InfoChip icon={<Building2 size={13} />} label={ledger.profile.unit_name} />}
                                                {ledger.profile.ciudad && <InfoChip icon={<MapPin size={13} />} label={ledger.profile.ciudad} />}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {ledger.profile.empresa && (
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(167,139,250,0.1)', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                        {ledger.profile.empresa}
                                                    </span>
                                                )}
                                                {ledger.profile.contrato && (
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(56,189,248,0.1)', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                        {ledger.profile.contrato}
                                                    </span>
                                                )}
                                                <span style={{
                                                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                                                    background: (ledger.profile.estado_planta || '').toLowerCase() === 'activo' ? 'rgba(74,222,128,0.1)' : 'rgba(148,163,184,0.1)',
                                                    color: (ledger.profile.estado_planta || '').toLowerCase() === 'activo' ? '#4ade80' : '#94a3b8',
                                                    textTransform: 'uppercase', letterSpacing: 0.5
                                                }}>
                                                    {ledger.profile.estado_planta || ledger.profile.status || 'Sin estado'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tallas */}
                                        <div style={{
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                            borderRadius: 16, padding: '1rem 1.25rem', minWidth: 180
                                        }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FFCD04', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Shirt size={13} /> Tallas Registradas
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                <TallaTag label="Camisa" value={ledger.profile.talla_camisa} />
                                                <TallaTag label="Pantalón" value={ledger.profile.talla_pantalon} />
                                                <TallaTag label="Zapato" value={ledger.profile.talla_zapato} />
                                                <TallaTag label="Chaqueta" value={ledger.profile.talla_chaqueta} />
                                            </div>
                                        </div>
                                    </div>

                                    {ledger.profile.start_date && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.78rem', color: '#475569' }}>
                                            📅 Fecha de ingreso: <span style={{ color: '#94a3b8' }}>{fmtDate(ledger.profile.start_date)}</span>
                                            {ledger.profile.cliente && <> &nbsp;·&nbsp; 🏢 Cliente: <span style={{ color: '#94a3b8' }}>{ledger.profile.cliente}</span></>}
                                            {ledger.profile.regional && <> &nbsp;·&nbsp; 🗺️ Regional: <span style={{ color: '#94a3b8' }}>{ledger.profile.regional}</span></>}
                                        </div>
                                    )}
                                </div>

                                {/* ── Selector de año ── */}
                                {years.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 }}>Año:</span>
                                        {years.map(y => (
                                            <button
                                                key={y}
                                                id={`year-tab-${y}`}
                                                onClick={() => setActiveYear(Number(y))}
                                                style={{
                                                    padding: '0.4rem 1rem', borderRadius: 99, border: 'none', cursor: 'pointer',
                                                    fontWeight: 800, fontSize: '0.8rem', transition: 'all 0.2s',
                                                    background: activeYear === Number(y) ? '#FFCD04' : 'rgba(255,255,255,0.05)',
                                                    color: activeYear === Number(y) ? '#000' : '#94a3b8'
                                                }}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* ── Timeline de períodos ── */}
                                {years.length === 0 ? (
                                    <div style={{
                                        background: 'rgba(15,19,34,0.4)', border: '1px dashed rgba(255,255,255,0.07)',
                                        borderRadius: 20, padding: '3rem', textAlign: 'center'
                                    }}>
                                        <AlertTriangle size={32} color="#475569" style={{ marginBottom: 12 }} />
                                        <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
                                            Sin entregas registradas para este colaborador
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        {[1, 2, 3].map(periodNum => {
                                            const delivery = deliveriesByYear[activeYear]?.[periodNum];
                                            const pc = PERIOD_COLORS[periodNum];
                                            const statusStyle = delivery ? getStatusStyle(delivery.status_name) : null;
                                            const survey = delivery ? getSurveyForDelivery(delivery.delivery_id) : null;
                                            const isExpanded = expandedDelivery === delivery?.delivery_id;

                                            return (
                                                <div key={periodNum} style={{
                                                    background: delivery ? pc.bg : 'rgba(15,19,34,0.3)',
                                                    border: `1px solid ${delivery ? pc.border : 'rgba(255,255,255,0.05)'}`,
                                                    borderRadius: 18, padding: '1.25rem', transition: 'all 0.3s',
                                                    cursor: delivery ? 'pointer' : 'default',
                                                    position: 'relative', overflow: 'hidden'
                                                }}
                                                    onClick={() => delivery && setExpandedDelivery(isExpanded ? null : delivery.delivery_id)}
                                                >
                                                    {/* Acento de color */}
                                                    {delivery && (
                                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: pc.accent, opacity: 0.7 }} />
                                                    )}

                                                    {/* Encabezado del período */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: delivery ? pc.accent : '#334155', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                                Período {periodNum}
                                                            </div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: delivery ? '#e2e8f0' : '#334155', marginTop: 2 }}>
                                                                {PERIOD_LABELS[periodNum]}
                                                            </div>
                                                        </div>
                                                        {delivery ? (
                                                            <div style={{
                                                                display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
                                                                borderRadius: 99, background: statusStyle.bg, color: statusStyle.color,
                                                                fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase'
                                                            }}>
                                                                {statusStyle.icon}
                                                                {delivery.status_name || 'Sin estado'}
                                                            </div>
                                                        ) : (
                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1e293b', border: '1px solid #334155' }} />
                                                        )}
                                                    </div>

                                                    {delivery ? (
                                                        <>
                                                            {/* Nro prendas */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                                                                <Package size={13} color={pc.accent} />
                                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                                    {delivery.details?.length || 0} prenda{delivery.details?.length !== 1 ? 's' : ''} entregada{delivery.details?.length !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>

                                                            {/* Firma */}
                                                            {delivery.signed_at && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
                                                                    <FileSignature size={13} color="#4ade80" />
                                                                    <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>
                                                                        Firmado {fmtDate(delivery.signed_at)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Envío */}
                                                            {delivery.shipping_carrier && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
                                                                    <Truck size={13} color="#38bdf8" />
                                                                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                                                                        {delivery.shipping_carrier}
                                                                        {delivery.shipping_guide && ` · ${delivery.shipping_guide}`}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Encuesta */}
                                                            {survey && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.5rem' }}>
                                                                    <Stars rating={survey.rating} />
                                                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{survey.rating}/5</span>
                                                                </div>
                                                            )}

                                                            {/* Indicador expandir */}
                                                            <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                                                                <span style={{ fontSize: '0.68rem', color: pc.accent, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                                                    {isExpanded ? 'Ocultar' : 'Ver prendas'} <ChevronRight size={12} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                                                                </span>
                                                            </div>

                                                            {/* Detalles expandidos */}
                                                            {isExpanded && delivery.details && delivery.details.length > 0 && (
                                                                <div style={{ marginTop: '1rem', borderTop: `1px solid ${pc.border}`, paddingTop: '1rem' }}
                                                                    onClick={e => e.stopPropagation()}>
                                                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: pc.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>
                                                                        Detalle de prendas
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                                        {delivery.details.map((d, i) => (
                                                                            <div key={i} style={{
                                                                                background: 'rgba(0,0,0,0.2)', borderRadius: 10,
                                                                                padding: '0.5rem 0.75rem',
                                                                                display: 'grid', gridTemplateColumns: '1fr auto',
                                                                                gap: '0.5rem', alignItems: 'center'
                                                                            }}>
                                                                                <div>
                                                                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>{d.item_name}</div>
                                                                                    {d.category && <div style={{ fontSize: '0.65rem', color: '#475569' }}>{d.category}</div>}
                                                                                </div>
                                                                                <div style={{ textAlign: 'right' }}>
                                                                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                                                                        {d.size_delivered ? (
                                                                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>
                                                                                                {d.size_delivered}
                                                                                            </span>
                                                                                        ) : d.size_requested ? (
                                                                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,205,4,0.1)', color: '#FFCD04' }}>
                                                                                                {d.size_requested}
                                                                                            </span>
                                                                                        ) : null}
                                                                                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                                                                                            x{d.quantity || 1}
                                                                                        </span>
                                                                                    </div>
                                                                                    {d.size_requested && d.size_delivered && d.size_requested !== d.size_delivered && (
                                                                                        <div style={{ fontSize: '0.6rem', color: '#f87171', marginTop: 2 }}>
                                                                                            Solic: {d.size_requested}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {survey?.comments && (
                                                                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,205,4,0.05)', borderRadius: 10, borderLeft: '2px solid rgba(255,205,4,0.3)' }}>
                                                                            <div style={{ fontSize: '0.65rem', color: '#FFCD04', fontWeight: 700, marginBottom: 2 }}>💬 Comentario encuesta</div>
                                                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{survey.comments}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div style={{ fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                                            Sin entrega en {activeYear}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* ── Resumen Encuestas ── */}
                                {ledger.surveys && ledger.surveys.length > 0 && (
                                    <div style={{
                                        background: 'rgba(255,205,4,0.04)', border: '1px solid rgba(255,205,4,0.1)',
                                        borderRadius: 16, padding: '1.25rem'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFCD04', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Star size={14} /> Satisfacción Promedio
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFCD04' }}>
                                                {(ledger.surveys.reduce((s, x) => s + (x.rating || 0), 0) / ledger.surveys.length).toFixed(1)}
                                            </div>
                                            <div>
                                                <Stars rating={Math.round(ledger.surveys.reduce((s, x) => s + (x.rating || 0), 0) / ledger.surveys.length)} />
                                                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                                                    Basado en {ledger.surveys.length} encuesta{ledger.surveys.length !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.9rem' }}>
                                No se pudo cargar el historial de este colaborador.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Animación del spinner */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-anim { animation: spin 1.2s linear infinite; }
            `}</style>
        </div>
    );
};

// ─── Subcomponentes auxiliares ───────────────────────────────────────────────
function InfoChip({ icon, label }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 99, padding: '3px 10px' }}>
            <span style={{ color: '#FFCD04', display: 'flex' }}>{icon}</span>
            {label}
        </span>
    );
}

function TallaTag({ label, value }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
            <span style={{
                fontSize: '0.85rem', fontWeight: 800, padding: '3px 10px', borderRadius: 8, textAlign: 'center',
                background: value ? 'rgba(255,205,4,0.08)' : 'rgba(255,255,255,0.03)',
                color: value ? '#FFCD04' : '#334155',
                border: `1px solid ${value ? 'rgba(255,205,4,0.2)' : 'rgba(255,255,255,0.05)'}`
            }}>
                {value || '—'}
            </span>
        </div>
    );
}

export default DotacionHistorial;
