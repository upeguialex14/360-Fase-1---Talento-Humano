import React, { useState, useRef } from 'react';
import api from '../services/api';

const Costos = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { success, message, totalProcessed, inserted }
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (selectedFile) => {
        setError(null);
        setResult(null);

        if (!selectedFile) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const validExt = /\.(xlsx|xls)$/i.test(selectedFile.name);

        if (!validTypes.includes(selectedFile.type) && !validExt) {
            setError('Formato inválido. Solo se permiten archivos Excel (.xlsx, .xls)');
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('El archivo supera el límite de 10MB.');
            return;
        }
        setFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Por favor selecciona un archivo Excel.');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const data = await api.upload('/etl/upload/COST_CENTER', formData);

            if (data && data.success) {
                setResult({
                    success: true,
                    totalProcessed: data.totalProcessed,
                    inserted: data.inserted,
                    message: `Carga exitosa: ${data.inserted} de ${data.totalProcessed} registros insertados.`
                });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setError(data?.message || 'Ocurrió un error en el servidor.');
            }
        } catch (err) {
            setError('Error de conexión: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page page-container">
            <style>{`
                .costos-header { margin-bottom: 2rem; }
                .costos-header h2 { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.3rem 0; }
                .costos-header p { color: #6b7280; margin: 0; }

                .costos-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 560px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                }
                .costos-card h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 1.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .drop-zone {
                    border: 2px dashed #d1d5db;
                    border-radius: 10px;
                    padding: 2.5rem 1rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: #f9fafb;
                }
                .drop-zone:hover, .drop-zone.active {
                    border-color: #6366f1;
                    background: #eef2ff;
                }
                .drop-zone .icon { font-size: 2.2rem; margin-bottom: 0.6rem; }
                .drop-zone p { margin: 0; color: #6b7280; font-size: 0.9rem; }
                .drop-zone .link { color: #6366f1; font-weight: 600; cursor: pointer; }

                .file-selected {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    background: #f0fdf4;
                    border: 1px solid #86efac;
                    border-radius: 8px;
                    padding: 0.8rem 1rem;
                    margin-top: 1rem;
                    font-size: 0.88rem;
                }
                .file-selected .file-name { flex: 1; font-weight: 500; color: #166534; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .file-selected .remove-btn { background: none; border: none; color: #dc2626; cursor: pointer; font-size: 1.1rem; padding: 0; }

                .btn-upload {
                    width: 100%;
                    margin-top: 1.5rem;
                    padding: 0.75rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .btn-upload:hover:not(:disabled) { background: #4f46e5; }
                .btn-upload:disabled { background: #a5b4fc; cursor: not-allowed; }

                .feedback-box {
                    margin-top: 1.2rem;
                    padding: 1rem 1.2rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }
                .feedback-box.success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
                .feedback-box.error   { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
                .feedback-box .fb-title { font-weight: 700; margin-bottom: 0.3rem; }
                .feedback-box .fb-stats { display: flex; gap: 1.5rem; margin-top: 0.5rem; }
                .feedback-box .fb-stat  { text-align: center; }
                .feedback-box .fb-stat span { display: block; font-size: 1.5rem; font-weight: 700; }
                .feedback-box .fb-stat small { font-size: 0.78rem; color: #4b5563; }

                .info-box {
                    margin-top: 2rem;
                    padding: 1rem 1.2rem;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    color: #1e40af;
                }
                .info-box strong { display: block; margin-bottom: 0.3rem; }
                .info-box ul { margin: 0; padding-left: 1.2rem; }
                .info-box ul li { margin-bottom: 0.2rem; }

                .spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    display: inline-block;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="costos-header">
                <h2>🏢 Centro de Costos</h2>
                <p>Carga y actualización masiva de centros de costo desde un archivo Excel.</p>
            </div>

            <div className="costos-card">
                <h3>📤 Cargar archivo Excel</h3>

                {/* Zona de Drag & Drop */}
                <div
                    className={`drop-zone${dragOver ? ' active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="icon">📊</div>
                    <p>Arrastra tu archivo aquí o <span className="link">haz clic para seleccionar</span></p>
                    <p style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}>Formatos soportados: .xlsx, .xls — Máximo 10MB</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                </div>

                {/* Archivo seleccionado */}
                {file && (
                    <div className="file-selected">
                        <span>📎</span>
                        <span className="file-name">{file.name}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                            {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                            className="remove-btn"
                            onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            title="Quitar archivo"
                        >✕</button>
                    </div>
                )}

                {/* Botón de carga */}
                <button
                    className="btn-upload"
                    onClick={handleUpload}
                    disabled={loading || !file}
                >
                    {loading
                        ? <><span className="spinner" /> Procesando...</>
                        : '🚀 Iniciar carga'
                    }
                </button>

                {/* Feedback éxito */}
                {result?.success && (
                    <div className="feedback-box success">
                        <div className="fb-title">✅ Carga completada</div>
                        <div className="fb-stats">
                            <div className="fb-stat">
                                <span>{result.totalProcessed}</span>
                                <small>Procesados</small>
                            </div>
                            <div className="fb-stat">
                                <span>{result.inserted}</span>
                                <small>Insertados</small>
                            </div>
                            <div className="fb-stat">
                                <span>{result.totalProcessed - result.inserted}</span>
                                <small>Duplicados omitidos</small>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback error */}
                {error && (
                    <div className="feedback-box error">
                        <div className="fb-title">❌ Error</div>
                        <p style={{ margin: '0.3rem 0 0 0' }}>{error}</p>
                    </div>
                )}

                {/* Info de columnas esperadas */}
                <div className="info-box">
                    <strong>📋 Columnas esperadas en el Excel:</strong>
                    <ul>
                        <li><b>PTR</b> — Código PTR del centro de costo</li>
                        <li><b>C.C HELISA</b> — Código Helisa</li>
                        <li><b>OFICINA</b>, <b>CLIENTE</b>, <b>UNIDAD DE NEGOCIO</b></li>
                        <li><b>CIUDAD</b>, <b>ZONA</b>, <b>REGIONAL</b>, <b>EMPRESA</b></li>
                        <li><b>LIDER</b>, <b>DEPARTAMENTO</b></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Costos;
