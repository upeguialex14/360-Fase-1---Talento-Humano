import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';

const Costos = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [existingData, setExistingData] = useState([]);
    const fileInputRef = useRef(null);

    const fetchExistingData = async () => {
        try {
            const response = await api.get('/etl/cost-centers');
            if (response.success) {
                setExistingData(response.data);
            }
        } catch (err) {
            console.error("Error al cargar datos existentes:", err);
        }
    };

    useEffect(() => {
        fetchExistingData();
    }, []);

    const handleFileSelect = (selectedFile) => {
        setError(null);
        setResult(null);
        setPreviewData([]);

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

        // Leer para previsualización
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Normalizar y filtrar columnas requeridas
                const normalizedData = jsonData.slice(0, 200).map(row => ({
                    'OFICINA': row['OFICINA'] || row['oficina'] || '',
                    'PTR': row['PTR'] || row['ptr'] || '',
                    'C.C HELISA': row['C.C HELISA'] || row['c.c helisa'] || row['HELISA'] || '',
                    'CLIENTE': row['CLIENTE'] || row['cliente'] || '',
                    'UNIDAD DE NEGOCIO': row['UNIDAD DE NEGOCIO'] || row['unidad de negocio'] || '',
                    'CIUDAD': row['CIUDAD'] || row['ciudad'] || '',
                    'ZONA': row['ZONA'] || row['zona'] || '',
                    'REGIONAL': row['REGIONAL'] || row['regional'] || '',
                    'EMPRESA': row['EMPRESA'] || row['empresa'] || '',
                    'LIDER': row['LIDER'] || row['lider'] || ''
                }));

                setPreviewData(normalizedData);
            } catch (err) {
                console.error("Error al procesar preview:", err);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
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
                    message: `Carga exitosa: ${data.inserted} de ${data.totalProcessed} registros procesados.`
                });
                setFile(null);
                setPreviewData([]); // Limpiar preview
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchExistingData(); // Refrescar tabla con datos nuevos
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
                .costos-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .costos-header { margin-bottom: 0.5rem; }
                .costos-header h2 { font-size: 1.8rem; font-weight: 700; color: #FFD700; margin: 0 0 0.5rem 0; }
                .costos-header p { color: #9ca3af; margin: 0; }

                .costos-main-grid {
                    display: grid;
                    grid-template-columns: 450px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                @media (max-width: 1100px) {
                    .costos-main-grid { grid-template-columns: 1fr; }
                }

                .costos-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .costos-card h3 {
                    color: #FFD700;
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0 0 1.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                }

                .drop-zone {
                    border: 2px dashed rgba(255, 215, 0, 0.3);
                    border-radius: 12px;
                    padding: 3rem 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(255, 215, 0, 0.02);
                }
                .drop-zone:hover, .drop-zone.active {
                    border-color: #FFD700;
                    background: rgba(255, 215, 0, 0.08);
                    transform: translateY(-2px);
                }
                .drop-zone .icon { font-size: 3rem; margin-bottom: 1rem; }
                .drop-zone p { margin: 0; color: #d1d5db; font-size: 0.95rem; }
                .drop-zone .link { color: #FFD700; font-weight: 600; text-decoration: underline; }

                .file-selected {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(72, 187, 120, 0.1);
                    border: 1px solid rgba(72, 187, 120, 0.3);
                    border-radius: 10px;
                    padding: 1rem;
                    margin-top: 1.5rem;
                    font-size: 0.9rem;
                    color: #9ae6b4;
                }
                .file-selected .file-name { flex: 1; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .file-selected .remove-btn { background: none; border: none; color: #f56565; cursor: pointer; font-size: 1.2rem; }

                .btn-upload {
                    width: 100%;
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: #FFD700;
                    color: #1C2A4A;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.7rem;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
                }
                .btn-upload:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4); }
                .btn-upload:disabled { background: #4b5563; color: #9ca3af; cursor: not-allowed; box-shadow: none; }

                .preview-section {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .preview-header {
                    padding: 1.2rem 1.5rem;
                    background: rgba(28, 42, 74, 0.5);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .preview-header h4 { margin: 0; color: #FFD700; font-size: 1.1rem; }
                .preview-header span { font-size: 0.85rem; color: #9ca3af; }

                .table-container {
                    overflow: auto;
                    max-height: 600px;
                }
                .excel-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                    color: #e2e8f0;
                    background: #1a202c !important;
                }
                .excel-table th {
                    position: sticky;
                    top: 0;
                    background: #111827 !important;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid #FFD700;
                    white-space: nowrap;
                    color: #FFD700;
                    z-index: 10;
                }
                .excel-table td {
                    padding: 0.8rem 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    white-space: nowrap;
                    background: #1a202c !important;
                    color: #e2e8f0 !important;
                }
                .excel-table tr:hover td { 
                    background: rgba(255, 255, 255, 0.05) !important; 
                }
                .empty-preview {
                    padding: 4rem 2rem;
                    text-align: center;
                    color: #718096;
                    background: #1a202c;
                }

                .feedback-box {
                    margin-top: 1.5rem;
                    padding: 1.2rem;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .feedback-box.success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; }
                .feedback-box.error   { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
                
                .fb-stats { display: flex; gap: 2rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
                .fb-stat span { display: block; font-size: 1.8rem; font-weight: 800; color: #fff; }
                .fb-stat small { font-size: 0.8rem; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }

                .info-box {
                    margin-top: 2rem;
                    padding: 1.2rem;
                    background: rgba(59, 130, 246, 0.05);
                    border-left: 4px solid #3b82f6;
                    border-radius: 0 8px 8px 0;
                    font-size: 0.85rem;
                    color: #93c5fd;
                }
                .info-box strong { color: #fff; display: block; margin-bottom: 0.5rem; font-size: 0.95rem; }
                .info-box ul { margin: 0; padding-left: 1.2rem; list-style-type: square; }
                .info-box ul li { margin-bottom: 0.3rem; }

                .spinner {
                    width: 20px; height: 20px;
                    border: 3px solid rgba(0,0,0,0.1);
                    border-top-color: #000;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="costos-header">
                <h2>🏢 Centro de Costos</h2>
                <p>Carga y actualización masiva de centros de costo desde un archivo Excel.</p>
            </div>

            <div className="costos-layout">
                <div className="costos-main-grid">
                    <div className="costos-card">
                        <h3>📤 Cargar archivo Excel</h3>

                        <div
                            className={`drop-zone${dragOver ? ' active' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="icon">📊</div>
                            <p>Arrastra tu archivo aquí o <span className="link">haz clic para seleccionar</span></p>
                            <p style={{ marginTop: '0.6rem', fontSize: '0.8rem', opacity: 0.7 }}>Soportado: .xlsx, .xls — Máx 10MB</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                            />
                        </div>

                        {file && (
                            <div className="file-selected">
                                <span>📎</span>
                                <span className="file-name">{file.name}</span>
                                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <button
                                    className="remove-btn"
                                    onClick={() => { 
                                        setFile(null); 
                                        setPreviewData([]);
                                        if (fileInputRef.current) fileInputRef.current.value = ''; 
                                    }}
                                    title="Quitar archivo"
                                >✕</button>
                            </div>
                        )}

                        <button
                            className="btn-upload"
                            onClick={handleUpload}
                            disabled={loading || !file}
                        >
                            {loading
                                ? <><span className="spinner" /> Procesando...</>
                                : <>🚀 Iniciar carga</>
                            }
                        </button>

                        {result?.success && (
                            <div className="feedback-box success">
                                <div style={{ fontWeight: 700 }}>✅ Carga completada exitosamente</div>
                                <div className="fb-stats">
                                    <div className="fb-stat">
                                        <span>{result.totalProcessed}</span>
                                        <small>Filas</small>
                                    </div>
                                    <div className="fb-stat">
                                        <span>{result.inserted}</span>
                                        <small>Nuevos</small>
                                    </div>
                                    <div className="fb-stat">
                                        <span>{result.totalProcessed - result.inserted}</span>
                                        <small>Omitidos</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="feedback-box error">
                                <div style={{ fontWeight: 700 }}>❌ Error en el proceso</div>
                                <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
                            </div>
                        )}

                        <div className="info-box">
                            <strong>📋 Columnas detectadas automáticamente:</strong>
                            <ul>
                                <li><b>OFICINA, PTR, C.C HELISA</b></li>
                                <li><b>CLIENTE, UNIDAD DE NEGOCIO</b></li>
                                <li><b>CIUDAD, ZONA, REGIONAL</b></li>
                                <li><b>EMPRESA, LIDER</b></li>
                            </ul>
                        </div>
                    </div>

                    <div className="preview-section">
                        <div className="preview-header">
                            <h4>👀 {file ? 'Vista Previa (Modo Excel)' : 'Registros Guardados'}</h4>
                            {(file ? previewData.length > 0 : existingData.length > 0) && (
                                <span>Mostrando {(file ? previewData : existingData).length} registros</span>
                            )}
                        </div>
                        
                        <div className="table-container">
                            {(file ? previewData : existingData).length > 0 ? (
                                <table className="excel-table">
                                    <thead>
                                        <tr>
                                            <th>OFICINA</th>
                                            <th>PTR</th>
                                            <th>C.C HELISA</th>
                                            <th>CLIENTE</th>
                                            <th>UNIDAD DE NEGOCIO</th>
                                            <th>CIUDAD</th>
                                            <th>ZONA</th>
                                            <th>REGIONAL</th>
                                            <th>EMPRESA</th>
                                            <th>LIDER</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(file ? previewData : existingData).map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.OFICINA}</td>
                                                <td>{row.PTR}</td>
                                                <td>{row['C.C HELISA']}</td>
                                                <td>{row.CLIENTE}</td>
                                                <td>{row['UNIDAD DE NEGOCIO']}</td>
                                                <td>{row.CIUDAD}</td>
                                                <td>{row.ZONA}</td>
                                                <td>{row.REGIONAL}</td>
                                                <td>{row.EMPRESA}</td>
                                                <td>{row.LIDER}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-preview">
                                    {file ? 'Procesando archivo...' : 'No hay registros guardados en la base de datos.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Costos;
