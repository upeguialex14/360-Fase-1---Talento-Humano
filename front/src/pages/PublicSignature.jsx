import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/DotacionLiquidEther.css';
import { Check, Edit3, XCircle, Package } from 'lucide-react';

const PublicSignature = () => {
    const { token } = useParams();
    const [delivery, setDelivery] = useState(null);
    const [signed, setSigned] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (token) loadDelivery();
    }, [token]);

    const loadDelivery = async () => {
        try {
            setLoading(true);
            // Llamada al endpoint público (no requiere auth)
            const res = await api.get(`/dotacion/public/firmas/${token}`);
            if (res && res.success) {
                setDelivery(res.data);
                if (res.data.estado_firma === 'Firmado') {
                    setSigned(true);
                }
            } else {
                setError(res?.message || 'No se pudo cargar el documento.');
            }
        } catch (err) {
            setError('Enlace inválido o expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async () => {
        if (!canvasRef.current) return;
        const signatureBase64 = canvasRef.current.toDataURL();
        try {
            setSubmitting(true);
            const res = await api.post(`/dotacion/public/firmas/${token}`, { firmaBase64: signatureBase64 });
            if (res && res.success) {
                setSigned(true);
            } else {
                setError(res?.message || 'Error al guardar la firma. Intenta nuevamente.');
            }
        } catch (err) {
            setError('Error de conexión al guardar la firma.');
        } finally {
            setSubmitting(false);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const startDrawing = (e) => {
        if (!canvasRef.current) return;
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const ctx = canvasRef.current.getContext('2d');
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#FFCD04';
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing || !canvasRef.current) return;
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const ctx = canvasRef.current.getContext('2d');
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);

    // ── Estado de carga ──────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#FFCD04', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ fontFamily: 'sans-serif' }}>Cargando documento...</p>
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────
    if (error && !delivery) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="nexus-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <h2 style={{ color: '#f87171', fontFamily: 'sans-serif', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Enlace No Válido
                    </h2>
                    <p style={{ color: '#9ca3af', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>{error}</p>
                </div>
            </div>
        );
    }

    // ── Ya firmado ───────────────────────────────────────────────
    if (signed) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="nexus-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem', border: '1px solid rgba(74,222,128,0.3)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>✅</span>
                    </div>
                    <h1 style={{ color: '#4ade80', fontFamily: 'sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                        ¡Firma Registrada!
                    </h1>
                    <p style={{ color: '#9ca3af', fontFamily: 'sans-serif', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        Gracias, <strong style={{ color: '#fff' }}>{delivery?.nombres_apellidos}</strong>.
                        Tu confirmación de entrega ha sido guardada exitosamente en el sistema.
                    </p>
                    <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.8rem' }}>
                        Puedes cerrar esta pestaña con seguridad.
                    </p>
                </div>
            </div>
        );
    }

    // ── Formulario de firma ──────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="nexus-card" style={{ width: '100%', maxWidth: '680px' }}>

                {/* Encabezado del acta */}
                <header style={{ borderBottom: '1px solid rgba(255,205,4,0.2)', paddingBottom: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <p style={{ color: '#FFCD04', fontFamily: 'sans-serif', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '0.5rem' }}>
                        Gestión 365 — Talento Humano
                    </p>
                    <h1 style={{ color: '#fff', fontFamily: 'sans-serif', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                        Acta de Recepción de Dotación
                    </h1>
                    <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Por favor verifica los artículos asignados y firma el documento
                    </p>
                </header>

                {/* Datos del colaborador */}
                <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <p style={{ color: '#FFCD04', fontFamily: 'sans-serif', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                        Datos del Colaborador
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.25rem' }}>Nombre Completo</p>
                            <p style={{ color: '#fff', fontFamily: 'sans-serif', fontWeight: 700, margin: 0 }}>{delivery?.nombres_apellidos}</p>
                        </div>
                        <div>
                            <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.25rem' }}>Documento / Cédula</p>
                            <p style={{ color: '#fff', fontFamily: 'sans-serif', fontWeight: 700, margin: 0 }}>{delivery?.cedula}</p>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.25rem' }}>Empresa</p>
                            <p style={{ color: '#fff', fontFamily: 'sans-serif', fontWeight: 700, margin: 0 }}>{delivery?.empresa}</p>
                        </div>
                    </div>
                </section>

                {/* Artículos a recibir */}
                <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <p style={{ color: '#FFCD04', fontFamily: 'sans-serif', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                        Artículos Asignados
                    </p>
                    {delivery?.items && delivery.items.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {delivery.items.map((item, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < delivery.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <span style={{ color: '#d1d5db', fontFamily: 'sans-serif', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                        {String(item.item).toLowerCase()}
                                    </span>
                                    <span style={{ color: '#fff', fontFamily: 'sans-serif', fontWeight: 900, background: 'rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem' }}>
                                        {item.cantidad}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.875rem', fontStyle: 'italic' }}>
                            No se encontraron artículos detallados en el registro.
                        </p>
                    )}
                </section>

                {/* Declaración */}
                <div style={{ background: 'rgba(255,205,4,0.05)', border: '1px solid rgba(255,205,4,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                    <p style={{ color: '#d4a800', fontFamily: 'sans-serif', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>
                        Al firmar este documento declaro que he recibido los artículos de dotación listados anteriormente en buen estado,
                        y que acepto las condiciones de uso establecidas por la empresa.
                    </p>
                </div>

                {/* Canvas de firma */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <p style={{ color: '#FFCD04', fontFamily: 'sans-serif', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                            Dibuja tu Firma
                        </p>
                        <button
                            onClick={clearCanvas}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#9ca3af', padding: '3px 12px', borderRadius: '999px', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.7rem', fontWeight: 700 }}
                        >
                            Limpiar
                        </button>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,205,4,0.3)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={220}
                            style={{ width: '100%', cursor: 'crosshair', display: 'block', touchAction: 'none' }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>
                    <p style={{ color: '#4b5563', fontFamily: 'sans-serif', fontSize: '0.7rem', textAlign: 'center', marginTop: '0.5rem' }}>
                        Firma con el cursor o con tu dedo en la pantalla táctil
                    </p>
                </div>

                {/* Error de envío */}
                {error && (
                    <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                        <p style={{ color: '#f87171', fontFamily: 'sans-serif', fontSize: '0.85rem', margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* Botón de confirmación */}
                <button
                    disabled={submitting}
                    onClick={handleSign}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: submitting ? 'rgba(255,205,4,0.5)' : '#FFCD04',
                        color: '#000',
                        border: 'none',
                        borderRadius: '10px',
                        fontFamily: 'sans-serif',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {submitting ? 'Registrando firma...' : '✍️  Confirmar y Firmar Entrega'}
                </button>
            </div>
        </div>
    );
};

export default PublicSignature;
