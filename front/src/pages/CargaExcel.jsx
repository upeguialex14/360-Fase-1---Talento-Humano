import React, { useState } from 'react';

const CargaExcel = () => {
    const [tipo, setTipo] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [historial, setHistorial] = useState(() => {
        const stored = localStorage.getItem('historial_cargas');
        return stored ? JSON.parse(stored) : [];
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile || null);
        setError(null);
        setMessage(null);
    };

    const updateHistorial = (tipo, filename, estado, total, errorMsg = '') => {
        const record = {
            id: Math.random().toString(36).substr(2, 9),
            tipo,
            filename,
            estado,
            fecha_inicio_proceso: new Date().toISOString(),
            fecha_fin_proceso: new Date().toISOString(),
            registros_procesados: total,
            registros_exitosos: estado === 'aceptado' ? total : 0,
            registros_fallidos: estado === 'rechazado' ? total : 0,
            mensaje_detalle: errorMsg
        };
        const newList = [record, ...historial];
        setHistorial(newList);
        localStorage.setItem('historial_cargas', JSON.stringify(newList));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tipo || !file) {
            setError('Complete todos los campos.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (tipo === 'orden_contratacion') {
                const formData = new FormData();
                formData.append('file', file);

                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/etl/upload/HIRING_ORDER`,
                    {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    }
                );

                const data = await response.json();

                if (data.success) {
                    const totalInserted = data.inserted ?? data.totalProcessed ?? 0;
                    const skippedMsg = data.skipped > 0 ? ` (${data.skipped} omitidos)` : '';
                    const successMsg = data.message
                        ? data.message
                        : `${totalInserted} registros insertados de ${data.totalProcessed || 0} procesados${skippedMsg}`;
                    setMessage(`Carga completada: ${successMsg}`);
                    updateHistorial('orden_contratacion', file.name, 'aceptado', totalInserted);
                } else {
                    setError(data.message || 'Error al procesar el archivo.');
                    updateHistorial('orden_contratacion', file.name, 'rechazado', 0, data.message);
                }

            } else {
                await new Promise(res => setTimeout(res, 1500));
                updateHistorial(tipo, file.name, 'aceptado', 100);
                setMessage('Archivo procesado satisfactoriamente (Simulado)');
            }

        } catch (err) {
            setError('Error en el servidor: ' + err.message);
            updateHistorial(tipo, file.name, 'rechazado', 0, err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTipoLabel = (t) => {
        const map = {
            orden_contratacion: 'Orden de Contratación',
            trabajadores: 'Trabajadores',
            ausencias: 'Ausencias',
            nomina: 'Nómina'
        };
        return map[t] || t;
    };

    return (
        <div className="page carga-page">
            <style>{`
                .carga-page { padding: 2rem; font-family: 'Segoe UI', sans-serif; color: #1a1a2e; }
                .carga-page h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 1.5rem; color: #1432A0; }
                .carga-form { display: flex; flex-direction: column; gap: 1.2rem; max-width: 480px; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 16px rgba(20,50,160,0.08); border: 1px solid #e8eaf6; }
                .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .form-group label { font-size: 0.85rem; font-weight: 600; color: #444; }
                .form-group select, .form-group input[type="file"] { padding: 0.55rem 0.75rem; border: 1px solid #d0d5e8; border-radius: 6px; font-size: 0.9rem; background: #fafbff; color: #1a1a2e; transition: border-color 0.2s; outline: none; }
                .form-group select:focus, .form-group input[type="file"]:focus { border-color: #1432A0; }
                .file-hint { font-size: 0.75rem; color: #888; margin-top: 0.2rem; }
                .btn-submit { background: #1432A0; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; margin-top: 0.5rem; transition: background 0.2s, transform 0.1s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
                .btn-submit:hover:not(:disabled) { background: #0f268a; }
                .btn-submit:active:not(:disabled) { transform: scale(0.98); }
                .btn-submit:disabled { background: #b0bcd8; cursor: not-allowed; }
                .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .alert { max-width: 480px; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; margin-top: 1rem; }
                .alert-error { color: #b71c1c; background: #ffebee; border: 1px solid #ffcdd2; }
                .alert-success { color: #1b5e20; background: #e8f5e9; border: 1px solid #c8e6c9; }
                .history-section { margin-top: 2.5rem; max-width: 900px; }
                .history-section h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: #333; }
                .history-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #e8eaf6; box-shadow: 0 1px 8px rgba(0,0,0,0.05); }
                .history-table-wrap table { width: 100%; border-collapse: collapse; background: white; font-size: 0.875rem; }
                .history-table-wrap th { background: #f0f3ff; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #1432A0; white-space: nowrap; }
                .history-table-wrap td { padding: 0.7rem 1rem; border-top: 1px solid #f0f0f0; color: #333; }
                .history-table-wrap tr:hover td { background: #fafbff; }
                .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
                .badge-ok { background: #e8f5e9; color: #2e7d32; }
                .badge-err { background: #ffebee; color: #c62828; }
                .empty-history { padding: 1.5rem; text-align: center; color: #aaa; font-size: 0.875rem; background: white; }
            `}</style>

            <h1>Carga Excel</h1>

            <form className="carga-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tipo de carga *</label>
                    <select
                        value={tipo}
                        onChange={(e) => { setTipo(e.target.value); setError(null); setMessage(null); }}
                        disabled={loading}
                    >
                        <option value="">-- Seleccione --</option>
                        <option value="orden_contratacion">Orden de Contratación</option>
                        <option value="trabajadores">Trabajadores</option>
                        <option value="ausencias">Ausencias</option>
                        <option value="nomina">Nómina</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Archivo Excel *</label>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                    <span className="file-hint">Formatos aceptados: .xlsx, .xls</span>
                </div>

                <button type="submit" className="btn-submit" disabled={loading || !tipo || !file}>
                    {loading ? (
                        <>
                            <span className="spinner" />
                            Procesando...
                        </>
                    ) : 'Cargar archivo'}
                </button>
            </form>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <div className="history-section">
                <h2>Historial de cargas</h2>
                <div className="history-table-wrap">
                    {historial.length === 0 ? (
                        <div className="empty-history">No hay cargas registradas aún.</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Archivo</th>
                                    <th>Estado</th>
                                    <th>Registros</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map((r, i) => (
                                    <tr key={i}>
                                        <td>{getTipoLabel(r.tipo)}</td>
                                        <td>{r.filename}</td>
                                        <td>
                                            <span className={`badge ${r.estado === 'aceptado' ? 'badge-ok' : 'badge-err'}`}>
                                                {r.estado === 'aceptado' ? 'Exitoso' : 'Rechazado'}
                                            </span>
                                        </td>
                                        <td>{r.registros_procesados}</td>
                                        <td>{new Date(r.fecha_inicio_proceso).toLocaleString('es-CO')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CargaExcel;