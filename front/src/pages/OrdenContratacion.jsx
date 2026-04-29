import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Listado completo de columnas según DB
 */
const ALL_COLUMNS = [
    { key: 'identificacion', label: 'Identificación', type: 'text', required: true, width: '150px' },
    { key: 'nombre_apellido', label: 'Nombre y Apellido', type: 'text', width: '250px' },
    { key: 'fecha_ingreso', label: 'Fecha Ingreso', type: 'text', width: '120px' },
    { key: 'cargo', label: 'Cargo', type: 'text', width: '180px' },
    { key: 'tipo_contrato', label: 'Tipo Contrato', type: 'text', width: '150px' },
    { key: 'salario', label: 'Salario', type: 'text', width: '120px' },
    { key: 'empleador', label: 'Empleador', type: 'text', width: '180px' },
    { key: 'ciudad', label: 'Ciudad', type: 'text', width: '130px' },
    { key: 'zona', label: 'Zona', type: 'text', width: '130px' },
    { key: 'arl', label: 'ARL', type: 'text', width: '120px' },
    { key: 'detalle', label: 'Detalle', type: 'text', width: '300px' },
    { key: 'oficina', label: 'Oficina', type: 'text', width: '180px' },
    { key: 'unidad', label: 'Unidad', type: 'text', width: '150px' },
    { key: 'cliente', label: 'Cliente', type: 'text', width: '180px' },
    { key: 'centro_costos', label: 'Centro Costos', type: 'text', width: '150px' },
    { key: 'jefe', label: 'Jefe', type: 'text', width: '180px' },
    { key: 'correo_jefe', label: 'Correo Jefe', type: 'text', width: '200px' },
    { key: 'analista_encargado', label: 'Analista', type: 'text', width: '180px' },
    { key: 'poligrafia', label: 'Poligrafía', type: 'text', width: '120px' },
    { key: 'confirmacion_seleccion', label: 'Conf. Selección', type: 'text', width: '150px' },
    { key: 'anexos', label: 'Anexos', type: 'text', width: '150px' },
    { key: 'verificacion_documentos', label: 'Verif. Documentos', type: 'text', width: '150px' },
    { key: 'verificacion_anexos', label: 'Verif. Anexos', type: 'text', width: '150px' },
    { key: 'observaciones', label: 'Observaciones', type: 'text', width: '300px' },
    { key: 'fecha_retiro', label: 'Fecha Retiro', type: 'text', width: '120px' },
    { key: 'fin_prueba', label: 'Fin Prueba', type: 'text', width: '120px' },
    { key: 'dias_prueba', label: 'Días Prueba', type: 'text', width: '100px' },
    { key: 'celular', label: 'Celular', type: 'text', width: '130px' },
    { key: 'correo_electronico', label: 'Correo Electrónico', type: 'text', width: '200px' },
    { key: 'direccion', label: 'Dirección', type: 'text', width: '250px' },
    { key: 'ciudad_personal', label: 'Ciudad Personal', type: 'text', width: '150px' },
    { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'text', width: '120px' },
    { key: 'fecha_expedicion_cc', label: 'Fecha Exp. CC', type: 'text', width: '120px' },
    { key: 'rh', label: 'RH', type: 'text', width: '80px' },
    { key: 'eps', label: 'EPS', type: 'text', width: '150px' },
    { key: 'ccf', label: 'CCF', type: 'text', width: '150px' },
    { key: 'afp', label: 'AFP', type: 'text', width: '150px' },
    { key: 'bh', label: 'BH', type: 'text', width: '150px' },
    { key: 'cuenta_bancaria', label: 'Cuenta Bancaria', type: 'text', width: '180px' },
];

const OrdenContratacion = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [modifiedIds, setModifiedIds] = useState(new Set());

    // Estados para Carga de Excel
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [isUploadVisible, setIsUploadVisible] = useState(false);
    const fileInputRef = useRef(null);

    const pageAccess = user?.pages?.find(p => p.page_code === 'ORDEN_CONTRATACION');
    const canEdit = pageAccess?.can_edit === 1 || user?.role_id === 1;

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const data = await api.get('/orden-contratacion');
            if (data.success) {
                setRecords(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Error al cargar los registros');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Lógica de Procesamiento de Excel
    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setError(null);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setError('El archivo está vacío.');
                    return;
                }

                // Obtener cabeceras del excel
                const excelHeaders = Object.keys(jsonData[0]);

                // Mapeo automático mejorado
                const aliases = {
                    "identificacion": ["identificacion", "id", "cedula", "cc", "documento", "ptr", "nro", "codigo"],
                    "nombre_apellido": ["nombre y apellido", "nombre completo", "nombres y apellidos", "empleado", "nombre", "apellido"],
                    "fecha_ingreso": ["fecha de ingreso", "fecha ingreso", "ingreso", "f. ingreso"],
                    "cargo": ["cargo", "puesto", "oficio", "empresa"],
                    "tipo_contrato": ["tipo de contrato", "contrato", "tipo contrato", "especializado"],
                    "salario": ["salario", "sueldo", "basico", "remuneracion"],
                    "oficina": ["oficina", "sucursal", "punto", "sede"],
                    "jefe": ["jefe", "lider", "supervisor", "jefe inmediato"],
                    "detalle": ["detalle", "justificacion", "motivo", "detalle la justificacion"],
                };

                const detectedMapping = {};
                ALL_COLUMNS.forEach(col => {
                    const colKey = col.key;
                    const colLabel = col.label.toLowerCase();
                    
                    // Buscar coincidencia exacta o por alias
                    const match = excelHeaders.find(h => {
                        const lowH = h.toLowerCase().trim();
                        if (lowH === colKey.toLowerCase() || lowH === colLabel) return true;
                        if (aliases[colKey] && aliases[colKey].includes(lowH)) return true;
                        return false;
                    });

                    if (match) detectedMapping[colKey] = match;
                });

                // Crear preview
                const preview = jsonData.slice(0, 10).map(row => {
                    const cleanRow = {};
                    ALL_COLUMNS.forEach(col => {
                        cleanRow[col.key] = row[detectedMapping[col.key]] || '';
                    });
                    return cleanRow;
                });

                setPreviewData(preview);
            } catch (err) {
                setError('Error al procesar el archivo: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        setMessage(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    // Re-aplicar mapeo a todos los registros
                    const excelHeaders = Object.keys(jsonData[0]);
                    const detectedMapping = {};
                    ALL_COLUMNS.forEach(col => {
                        const lowLabel = col.label.toLowerCase();
                        const match = excelHeaders.find(h => {
                            const lowH = h.toLowerCase().trim();
                            const colAliases = {
                                "identificacion": ["identificacion", "id", "cedula", "cc", "documento", "ptr", "nro", "codigo"],
                                "cargo": ["cargo", "puesto", "oficio", "empresa"],
                                "jefe": ["jefe", "lider", "supervisor"],
                                "oficina": ["oficina", "sucursal"]
                            };
                            if (lowH === col.key.toLowerCase() || lowH === lowLabel) return true;
                            if (colAliases[col.key] && colAliases[col.key].includes(lowH)) return true;
                            return false;
                        });
                        if (match) detectedMapping[col.key] = match;
                    });

                    const recordsToUpload = jsonData.map(row => {
                        const cleanRow = {};
                        ALL_COLUMNS.forEach(col => {
                            cleanRow[col.key] = row[detectedMapping[col.key]] || '';
                        });
                        return cleanRow;
                    });

                    const response = await api.post('/orden-contratacion/upsert', { records: recordsToUpload });
                    if (response.success) {
                        setMessage(`Carga exitosa: ${response.summary?.inserted ?? 0} nuevos, ${response.summary?.updated ?? 0} actualizados.`);
                        setFile(null);
                        setPreviewData([]);
                        setIsUploadVisible(false);
                        fetchRecords();
                    } else {
                        setError(response.message);
                    }
                } catch (err) {
                    setError('Error en el procesamiento: ' + err.message);
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            setError('Error al subir el archivo');
            setUploading(false);
        }
    };

    const handleEdit = (id, field, value) => {
        setRecords(prev => prev.map(row => {
            if (row.id === id) {
                return { ...row, [field]: value };
            }
            return row;
        }));
        setModifiedIds(prev => new Set(prev).add(id));
    };

    const handleAddRow = () => {
        const tempId = `new-${Date.now()}`;
        const newRow = { id: tempId, isNew: true };
        ALL_COLUMNS.forEach(col => {
            newRow[col.key] = '';
        });
        setRecords(prev => [newRow, ...prev]);
        setModifiedIds(prev => new Set(prev).add(tempId));
    };

    const handleSave = async () => {
        if (modifiedIds.size === 0) return;
        const modifiedRows = records.filter(row => modifiedIds.has(row.id));
        const missingIdent = modifiedRows.some(r => !r.identificacion || r.identificacion.toString().trim() === '');
        if (missingIdent) {
            alert('La identificación es obligatoria.');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const data = await api.put('/orden-contratacion/bulk-update', { modifiedRows });
            if (data.success) {
                setMessage('Cambios guardados correctamente');
                setModifiedIds(new Set());
                fetchRecords();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Error al guardar los cambios: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page orden-container">
            <style>{`
                .orden-container {
                    padding: 2rem;
                    background: #1C2A4A;
                    min-height: 100vh;
                    color: white;
                    font-family: 'Inter', sans-serif;
                }

                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .title-group h1 {
                    font-size: 2rem;
                    color: #FFD700;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                }

                .title-group p {
                    color: #a0aec0;
                    margin: 0.5rem 0 0;
                }

                .actions-group {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .btn-premium {
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-upload-toggle {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .btn-add {
                    background: rgba(255, 215, 0, 0.1);
                    color: #FFD700;
                    border: 1px solid #FFD700;
                }

                .btn-save {
                    background: #FFD700;
                    color: #1C2A4A;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
                }

                /* Sección de Carga Directa */
                .upload-section {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    animation: slideDown 0.4s ease-out;
                }

                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .upload-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 2rem;
                }

                @media (max-width: 1100px) {
                    .upload-grid { grid-template-columns: 1fr; }
                }

                .drop-zone {
                    border: 2px dashed rgba(255, 215, 0, 0.3);
                    border-radius: 16px;
                    padding: 2.5rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .drop-zone:hover, .drop-zone.active {
                    border-color: #FFD700;
                    background: rgba(255, 215, 0, 0.05);
                }

                .drop-zone .icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
                
                .preview-mini-table {
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    overflow: auto;
                    max-height: 250px;
                }

                .preview-mini-table table {
                    width: 100%;
                    font-size: 0.75rem;
                }

                .preview-mini-table th { background: #1a202c; color: #FFD700; padding: 8px; position: sticky; top: 0; }
                .preview-mini-table td { padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); }

                /* Tabla Principal */
                .glass-table-wrapper {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: auto;
                    height: calc(100vh - 250px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                thead th {
                    background: rgba(28, 42, 74, 0.95);
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    padding: 1rem;
                    text-align: left;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #FFD700;
                    border-bottom: 2px solid rgba(255, 215, 0, 0.3);
                }

                tbody tr:hover { background: rgba(255, 255, 255, 0.05); }
                td { padding: 0.5rem; border-right: 1px solid rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }

                .cell-input {
                    width: 100%;
                    background: transparent;
                    border: 1px solid transparent;
                    color: #e2e8f0;
                    padding: 0.5rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                }

                .cell-input:focus { background: rgba(255, 255, 255, 0.08); border-color: #FFD700; outline: none; }
                
                .status-msg {
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                }
                .status-error { background: rgba(245, 101, 101, 0.1); color: #feb2b2; border: 1px solid #f56565; }
                .status-success { background: rgba(72, 187, 120, 0.1); color: #9ae6b4; border: 1px solid #48bb78; }
            `}</style>

            <div className="header-section">
                <div className="title-group">
                    <h1>Orden de Contratación</h1>
                    <p>Gestión integral de ingresos y procesos operativos</p>
                </div>
                <div className="actions-group">
                    <button 
                        className={`btn-premium btn-upload-toggle ${isUploadVisible ? 'active' : ''}`} 
                        onClick={() => setIsUploadVisible(!isUploadVisible)}
                    >
                        <span>📊</span> {isUploadVisible ? 'Cerrar Carga' : 'Cargar Excel'}
                    </button>
                    <button className="btn-premium btn-add" onClick={handleAddRow} disabled={loading || uploading || !canEdit}>
                        <span>+</span> Nueva Fila
                    </button>
                    <button
                        className="btn-premium btn-save"
                        onClick={handleSave}
                        disabled={loading || uploading || modifiedIds.size === 0 || !canEdit}
                    >
                        {loading ? 'Procesando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {isUploadVisible && (
                <div className="upload-section">
                    <div className="upload-grid">
                        <div className="upload-controls">
                            <div 
                                className={`drop-zone ${dragOver ? 'active' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span className="icon">📂</span>
                                <p>{file ? file.name : 'Arrastra tu Excel aquí o haz clic'}</p>
                                <input 
                                    ref={fileInputRef} 
                                    type="file" 
                                    accept=".xlsx,.xls" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleFileSelect(e.target.files[0])}
                                />
                            </div>
                            
                            {file && (
                                <button 
                                    className="btn-premium btn-save" 
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Subiendo...' : '🚀 Procesar y Cargar'}
                                </button>
                            )}
                        </div>

                        <div className="preview-container">
                            <h4 style={{ color: '#FFD700', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Previsualización de Datos Detectados
                            </h4>
                            <div className="preview-mini-table">
                                {previewData.length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                {ALL_COLUMNS.slice(0, 8).map(col => <th key={col.key}>{col.label}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, i) => (
                                                <tr key={i}>
                                                    {ALL_COLUMNS.slice(0, 8).map(col => <td key={col.key}>{row[col.key]}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
                                        Seleccione un archivo para ver la detección automática.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="status-msg status-error">{error}</div>}
            {message && <div className="status-msg status-success">{message}</div>}

            <div className="glass-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {ALL_COLUMNS.map(col => (
                                <th key={col.key} style={{ minWidth: col.width }}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(row => (
                            <tr
                                key={row.id}
                                className={`${modifiedIds.has(row.id) ? 'row-modified' : ''} ${row.isNew ? 'row-new' : ''}`}
                            >
                                {ALL_COLUMNS.map(col => (
                                    <td key={col.key} className={modifiedIds.has(row.id) ? 'cell-modified' : ''}>
                                        <input
                                            type="text"
                                            className="cell-input"
                                            value={row[col.key] || ''}
                                            onChange={(e) => handleEdit(row.id, col.key, e.target.value)}
                                            placeholder="..."
                                            readOnly={!canEdit}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdenContratacion;
