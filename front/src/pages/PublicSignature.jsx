import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useDotacion from '../hooks/useDotacion';
import '../styles/Dotacion.css';

const PublicSignature = () => {
    const { token } = useParams();
    const { validateToken, signDelivery, loading, error } = useDotacion();
    const [delivery, setDelivery] = useState(null);
    const [signed, setSigned] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (token) {
            loadDelivery();
        }
    }, [token]);

    const loadDelivery = async () => {
        const res = await validateToken(token);
        if (res.success) setDelivery(res.data);
    };

    const handleSign = async () => {
        // En un entorno real usaríamos una librería como react-signature-canvas
        // Aquí simulamos obteniendo el dataURL de un canvas básico
        const signatureBase64 = canvasRef.current.toDataURL();
        const res = await signDelivery(token, signatureBase64);
        if (res.success) setSigned(true);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    if (loading) return <div className="dot-container">Cargando datos de entrega...</div>;
    if (error) return <div className="dot-container" style={{ color: 'var(--dot-danger)' }}>Error: {error}</div>;
    if (!delivery) return <div className="dot-container">Link inválido o expirado.</div>;

    if (signed) {
        return (
            <div className="dot-container" style={{ textAlign: 'center', maxWidth: '500px', margin: 'auto' }}>
                <div className="dot-panel" style={{ padding: '3rem' }}>
                    <div style={{ fontSize: '4rem' }}>✅</div>
                    <h1 style={{ marginTop: '1rem' }}>¡Firma Registrada!</h1>
                    <p style={{ color: 'var(--dot-text-muted)' }}>Gracias, {delivery.full_name}. Tu entrega ha sido confirmada exitosamente.</p>
                    <button className="dot-btn dot-btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dot-container" style={{ maxWidth: '600px', margin: 'auto' }}>
            <div className="dot-panel">
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Confirmar Recepción</h1>
                    <p style={{ color: 'var(--dot-text-muted)' }}>Hola {delivery.full_name}, por favor verifica tus prendas y firma abajo.</p>
                </header>

                <div style={{ background: 'var(--dot-bg)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Items a recibir:</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {delivery.details?.map((item, i) => (
                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                <span>{item.item_name}</span>
                                <span style={{ fontWeight: 600 }}>Talla {item.size_delivered || item.size_requested}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tu Firma:</label>
                    <div style={{ border: '2px dashed var(--dot-border)', borderRadius: '0.5rem', background: '#fff' }}>
                        <canvas 
                            ref={canvasRef} 
                            width={500} 
                            height={200} 
                            style={{ width: '100%', cursor: 'crosshair' }}
                            onMouseDown={(e) => {
                                const ctx = canvasRef.current.getContext('2d');
                                ctx.beginPath();
                                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                canvasRef.current.isDrawing = true;
                            }}
                            onMouseMove={(e) => {
                                if (!canvasRef.current.isDrawing) return;
                                const ctx = canvasRef.current.getContext('2d');
                                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                ctx.stroke();
                            }}
                            onMouseUp={() => canvasRef.current.isDrawing = false}
                        />
                    </div>
                    <button className="dot-btn dot-btn-ghost" onClick={clearCanvas} style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        Limpiar Firma
                    </button>
                </div>

                <button className="dot-btn dot-btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleSign}>
                    Confirmar y Firmar Entrega
                </button>
            </div>
        </div>
    );
};

export default PublicSignature;
