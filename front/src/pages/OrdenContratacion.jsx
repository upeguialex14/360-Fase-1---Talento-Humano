import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ALL_COLUMNS = [
    { key: 'identificacion', label: 'Identificación', width: '150px' },
    { key: 'nombre_apellido', label: 'Nombre y Apellido', width: '250px' },
    { key: 'fecha_ingreso', label: 'Fecha Ingreso', width: '120px' },
    { key: 'cargo', label: 'Cargo', width: '180px' },
    { key: 'tipo_contrato', label: 'Tipo Contrato', width: '150px' },
    { key: 'salario', label: 'Salario', width: '120px' },
    { key: 'empleador', label: 'Empleador', width: '180px' },
    { key: 'ciudad', label: 'Ciudad', width: '130px' },
    { key: 'zona', label: 'Zona', width: '130px' },
    { key: 'arl', label: 'ARL', width: '120px' },
    { key: 'detalle', label: 'Detalle', width: '300px' },
    { key: 'oficina', label: 'Oficina', width: '180px' },
    { key: 'unidad', label: 'Unidad', width: '150px' },
    { key: 'cliente', label: 'Cliente', width: '180px' },
    { key: 'centro_costos', label: 'Centro Costos', width: '150px' },
    { key: 'jefe', label: 'Jefe', width: '180px' },
    { key: 'correo_jefe', label: 'Correo Jefe', width: '200px' },
    { key: 'analista_encargado', label: 'Analista', width: '180px' },
    { key: 'poligrafia', label: 'Poligrafía', width: '120px' },
    { key: 'confirmacion_seleccion', label: 'Conf. Selección', width: '150px' },
    { key: 'anexos', label: 'Anexos', width: '150px' },
    { key: 'verificacion_documentos', label: 'Verif. Documentos', width: '150px' },
    { key: 'verificacion_anexos', label: 'Verif. Anexos', width: '150px' },
    { key: 'observaciones', label: 'Observaciones', width: '300px' },
    { key: 'fecha_retiro', label: 'Fecha Retiro', width: '120px' },
    { key: 'fin_prueba', label: 'Fin Prueba', width: '120px' },
    { key: 'dias_prueba', label: 'Días Prueba', width: '100px' },
    { key: 'celular', label: 'Celular', width: '130px' },
    { key: 'correo_electronico', label: 'Correo Electrónico', width: '200px' },
    { key: 'direccion', label: 'Dirección', width: '250px' },
    { key: 'ciudad_personal', label: 'Ciudad Personal', width: '150px' },
    { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', width: '120px' },
    { key: 'fecha_expedicion_cc', label: 'Fecha Exp. CC', width: '120px' },
    { key: 'rh', label: 'RH', width: '80px' },
    { key: 'eps', label: 'EPS', width: '150px' },
    { key: 'ccf', label: 'CCF', width: '150px' },
    { key: 'afp', label: 'AFP', width: '150px' },
    { key: 'bh', label: 'BH', width: '150px' },
    { key: 'cuenta_bancaria', label: 'Cuenta Bancaria', width: '180px' },
];

// El backend retorna alias que coinciden 1:1 con las keys de ALL_COLUMNS
const mapBackendRow = (row) => {
    const mapped = { id: row.order_id };
    ALL_COLUMNS.forEach(col => {
        if (col.key === 'poligrafia') {
            mapped[col.key] = row.poligrafia == 1 ? 'APROBADO' : (row.poligrafia || '');
        } else {
            mapped[col.key] = row[col.key] ?? '';
        }
    });
    return mapped;
};

const OrdenContratacion = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [modifiedIds, setModifiedIds] = useState(new Set());

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
                // ← AGREGA ESTO
                console.log('RAW backend row[0]:', JSON.stringify(data.data[0], null, 2));
                setRecords(data.data.map(mapBackendRow));
            }
        } catch {
            setError('Error al cargar los registros');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, []);

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setError(null);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                if (jsonData.length === 0) { setError('El archivo está vacío.'); return; }
                setPreviewData(jsonData.slice(0, 10));
            } catch (err) {
                setError('Error al procesar el archivo: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    // Envía JSON crudo — el backend norm() lo normaliza
    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        setMessage(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rawJson = XLSX.utils.sheet_to_json(worksheet);

                    if (rawJson.length === 0) {
                        setError('El archivo está vacío.');
                        setUploading(false);
                        return;
                    }

                    const response = await api.post('/orden-contratacion/upsert', { records: rawJson });

                    if (response.success) {
                        setMessage(`Carga exitosa: ${response.processed} registros procesados.`);
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
        } catch {
            setError('Error al subir el archivo');
            setUploading(false);
        }
    };

    const handleEdit = (id, field, value) => {
        setRecords(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
        setModifiedIds(prev => new Set(prev).add(id));
    };

    const handleAddRow = () => {
        const tempId = `new-${Date.now()}`;
        const newRow = { id: tempId, isNew: true };
        ALL_COLUMNS.forEach(col => { newRow[col.key] = ''; });
        setRecords(prev => [newRow, ...prev]);
        setModifiedIds(prev => new Set(prev).add(tempId));
    };

    const handleSave = async () => {
        if (modifiedIds.size === 0) return;
        const modifiedRows = records.filter(row => modifiedIds.has(row.id));
        if (modifiedRows.some(r => !r.identificacion?.toString().trim())) {
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
            setError('Error al guardar: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('¿Eliminar TODOS los registros de Orden de Contratación?')) return;
        try {
            await api.delete('/orden-contratacion');
            setRecords([]);
            setMessage('Registros eliminados');
        } catch (e) {
            setError('Error: ' + e.message);
        }
    };

    const previewHeaders = previewData.length > 0 ? Object.keys(previewData[0]).slice(0, 8) : [];

    return (
        <div className="page orden-container">
            <style>{`
                .orden-container { padding: 2rem; background: #1C2A4A; min-height: 100vh; color: white; font-family: 'Inter', sans-serif; }
                .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.5rem; }
                .title-group h1 { font-size: 2rem; color: #FFD700; margin: 0; text-shadow: 0 0 10px rgba(255,215,0,0.3); }
                .title-group p  { color: #a0aec0; margin: 0.5rem 0 0; }
                .actions-group  { display: flex; gap: 1rem; flex-wrap: wrap; }
                .btn-premium { padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; border: none; display: flex; align-items: center; gap: 0.5rem; }
                .btn-upload-toggle { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
                .btn-add    { background: rgba(255,215,0,0.1); color: #FFD700; border: 1px solid #FFD700; }
                .btn-save   { background: #FFD700; color: #1C2A4A; box-shadow: 0 4px 15px rgba(255,215,0,0.2); }
                .btn-danger { background: #EF4444; color: white; border: 1px solid #EF4444; }
                .btn-premium:disabled { opacity: 0.5; cursor: not-allowed; }
                .upload-section { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; animation: slideDown 0.4s ease-out; }
                @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .upload-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
                @media (max-width: 1100px) { .upload-grid { grid-template-columns: 1fr; } }
                .drop-zone { border: 2px dashed rgba(255,215,0,0.3); border-radius: 16px; padding: 2.5rem; text-align: center; cursor: pointer; transition: all 0.3s ease; }
                .drop-zone:hover, .drop-zone.active { border-color: #FFD700; background: rgba(255,215,0,0.05); }
                .drop-zone .icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
                .preview-mini-table { background: rgba(0,0,0,0.2); border-radius: 12px; overflow: auto; max-height: 250px; }
                .preview-mini-table table { width: 100%; font-size: 0.75rem; }
                .preview-mini-table th { background: #1a202c; color: #FFD700; padding: 8px; position: sticky; top: 0; white-space: nowrap; }
                .preview-mini-table td { padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); white-space: nowrap; }
                .glass-table-wrapper { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: auto; height: calc(100vh - 250px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
                table { width: 100%; border-collapse: separate; border-spacing: 0; }
                thead th { background: rgba(28,42,74,0.95); position: sticky; top: 0; z-index: 20; padding: 1rem; text-align: left; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #FFD700; border-bottom: 2px solid rgba(255,215,0,0.3); white-space: nowrap; }
                tbody tr:hover { background: rgba(255,255,255,0.05); }
                td { padding: 0.5rem; border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .cell-input { width: 100%; background: transparent; border: 1px solid transparent; color: #e2e8f0; padding: 0.5rem; border-radius: 6px; font-size: 0.9rem; }
                .cell-input:focus { background: rgba(255,255,255,0.08); border-color: #FFD700; outline: none; }
                .row-modified td { background: rgba(255,215,0,0.04); }
                .status-msg     { padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
                .status-error   { background: rgba(245,101,101,0.1); color: #feb2b2; border: 1px solid #f56565; }
                .status-success { background: rgba(72,187,120,0.1);  color: #9ae6b4; border: 1px solid #48bb78; }
            `}</style>

            <div className="header-section">
                <div className="title-group">
                    <h1>Orden de Contratación</h1>
                    <p>Gestión integral de ingresos y procesos operativos</p>
                </div>
                <div className="actions-group">
                    <button className={`btn-premium btn-upload-toggle ${isUploadVisible ? 'active' : ''}`} onClick={() => setIsUploadVisible(v => !v)}>
                        <span>📊</span> {isUploadVisible ? 'Cerrar Carga' : 'Cargar Excel'}
                    </button>
                    <button className="btn-premium btn-add" onClick={handleAddRow} disabled={loading || uploading || !canEdit}>
                        <span>+</span> Nueva Fila
                    </button>
                    <button className="btn-premium btn-save" onClick={handleSave} disabled={loading || uploading || modifiedIds.size === 0 || !canEdit}>
                        {loading ? 'Procesando...' : 'Guardar Cambios'}
                    </button>
                    <button className="btn-premium btn-danger" onClick={handleDeleteAll} disabled={loading || uploading || !canEdit}>
                        🗑️ Eliminar Todos
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
                                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e.target.files[0])} />
                            </div>
                            {file && (
                                <button className="btn-premium btn-save" style={{ width: '100%', marginTop: '1rem' }} onClick={handleUpload} disabled={uploading}>
                                    {uploading ? 'Subiendo...' : '🚀 Procesar y Cargar'}
                                </button>
                            )}
                        </div>
                        <div className="preview-container">
                            <h4 style={{ color: '#FFD700', marginBottom: '1rem', fontSize: '0.9rem' }}>Vista previa — columnas detectadas del Excel</h4>
                            <div className="preview-mini-table">
                                {previewData.length > 0 ? (
                                    <table>
                                        <thead><tr>{previewHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {previewData.map((row, i) => (
                                                <tr key={i}>{previewHeaders.map(h => <td key={h}>{row[h] ?? ''}</td>)}</tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>Selecciona un archivo para ver la vista previa.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="status-msg status-error">{error}</div>}
            {message && <div className="status-msg status-success">{message}</div>}

            <div className="glass-table-wrapper">
                {loading && records.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>Cargando registros...</div>
                ) : (
                    <table>
                        <thead>
                            <tr>{ALL_COLUMNS.map(col => <th key={col.key} style={{ minWidth: col.width }}>{col.label}</th>)}</tr>
                        </thead>
                        <tbody>
                            {records.map(row => (
                                <tr key={row.id} className={modifiedIds.has(row.id) ? 'row-modified' : ''}>
                                    {ALL_COLUMNS.map(col => (
                                        <td key={col.key}>
                                            <input
                                                type="text"
                                                className="cell-input"
                                                value={row[col.key] ?? ''}
                                                onChange={(e) => handleEdit(row.id, col.key, e.target.value)}
                                                placeholder="—"
                                                readOnly={!canEdit}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrdenContratacion;