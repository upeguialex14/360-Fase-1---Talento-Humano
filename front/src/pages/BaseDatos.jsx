import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';

const BaseDatos = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [existingData, setExistingData] = useState([]);
    const fileInputRef = useRef(null);

    const COLUMNS = [
        { key: 'tipo_identificacion', label: 'TIPO ID' },
        { key: 'empresa', label: 'EMPRESA' },
        { key: 'cedula', label: 'CEDULA' },
        { key: 'apellidos_nombres', label: 'APELLIDOS Y NOMBRES' },
        { key: 'cargo', label: 'CARGO' },
        { key: 'fecha_ingreso', label: 'FECHA INGRESO' },
        { key: 'tipo_contrato', label: 'TIPO CONTRATO' },
        { key: 'ciudad', label: 'CIUDAD' },
        { key: 'unidad_negocio', label: 'UNIDAD DE NEGOCIO' },
        { key: 'cliente', label: 'CLIENTE' },
        { key: 'ceco', label: 'CECO' },
        { key: 'oficina', label: 'OFICINA' },
        { key: 'fecha_vencimiento', label: 'FECHA VENCIMIENTO' },
        { key: 'sueldo_2026', label: 'SUELDO 2026' },
        { key: 'auxilio_alimentacion', label: 'AUX ALIMENTACION' },
        { key: 'auxilio_adicional_transporte', label: 'AUX TRASP ADIC' },
        { key: 'bonificacion', label: 'BONIFICACION' },
        { key: 'auxilio_rodamientos_1q', label: 'ROD 1Q' },
        { key: 'auxilio_rodamientos_2q', label: 'ROD 2Q' },
        { key: 'auxilio_trans_extralegal', label: 'TRANS EXTRA' },
        { key: 'auxilio_conectividad', label: 'CONECTIVIDAD' },
        { key: 'autorizacion_tramite_datos', label: 'TRAMITE DATOS' },
        { key: 'expedicion_documento', label: 'EXP DOCUMENTO' },
        { key: 'genero', label: 'GENERO' },
        { key: 'orientacion_sexual', label: 'ORIENTACION' },
        { key: 'poblacion_especial', label: 'POBLACION' },
        { key: 'grupo_etnico', label: 'ETNIA' },
        { key: 'fecha_nacimiento', label: 'NACIMIENTO' },
        { key: 'estado_civil', label: 'ESTADO CIVIL' },
        { key: 'nombre_pareja', label: 'PAREJA' },
        { key: 'nro_pareja', label: 'N° PAREJA' },
        { key: 'rh', label: 'RH' },
        { key: 'enfermedades', label: 'ENFERMEDADES' },
        { key: 'otras_enfermedades', label: 'OTRAS ENF' },
        { key: 'ultimo_nivel_estudio', label: 'ESTUDIO' },
        { key: 'nombre_titulo', label: 'TITULO' },
        { key: 'correo_electronico', label: 'CORREO' },
        { key: 'telefono', label: 'TELEFONO' },
        { key: 'nombre_contacto_emergencia', label: 'EMER NOMBRE' },
        { key: 'parentesco_contacto', label: 'EMER PAREN' },
        { key: 'cel_emergencia', label: 'EMER CEL' },
        { key: 'tel_fijo_emergencia', label: 'EMER FIJO' },
        { key: 'departamento', label: 'DEPARTAMENTO' },
        { key: 'ciudad_residencia', label: 'CIUDAD RES' },
        { key: 'barrio', label: 'BARRIO' },
        { key: 'direccion', label: 'DIRECCION' },
        { key: 'estrato', label: 'ESTRATO' },
        { key: 'tipo_vivienda', label: 'VIVIENDA' },
        { key: 'cuenta_vehiculo_propio', label: 'VEHICULO' },
        { key: 'nro_hijos', label: 'HIJOS' },
        { key: 'fn_h1', label: 'H1 NAC' }, { key: 'nro_doc_h1', label: 'H1 DOC' },
        { key: 'fn_h2', label: 'H2 NAC' }, { key: 'nro_doc_h2', label: 'H2 DOC' },
        { key: 'fn_h3', label: 'H3 NAC' }, { key: 'nro_doc_h3', label: 'H3 DOC' },
        { key: 'fn_h4', label: 'H4 NAC' }, { key: 'nro_doc_h4', label: 'H4 DOC' },
        { key: 'fn_h5', label: 'H5 NAC' }, { key: 'nro_doc_h5', label: 'H5 DOC' },
        { key: 't_camisa', label: 'CAMISA' },
        { key: 't_pantalon', label: 'PANTALON' },
        { key: 't_zapatos', label: 'ZAPATOS' },
        { key: 't_chaquetas', label: 'CHAQUETA' },
        { key: 't_chalecos', label: 'CHALECO' },
        { key: 'familiar_en_empresa', label: 'FAMILIAR EMPRESA' },
        { key: 'compania', label: 'COMPAÑIA' },
        { key: 'parentesco', label: 'PARENTESCO' },
        { key: 'hv_referida', label: 'HV REFERIDA' },
        { key: 'nombre_referido', label: 'REFERIDO POR' },
        { key: 'familiares_pep', label: 'FAM PEP' },
        { key: 'porque_pep', label: 'PORQUE PEP' },
        { key: 'cargo_publico', label: 'CARGO PUBLICO' },
        { key: 'salud', label: 'SALUD' },
        { key: 'pension', label: 'PENSION' },
        { key: 'caja', label: 'CAJA' },
        { key: 'cuenta_bancaria', label: 'CUENTA' },
        { key: 'fecha_retiro', label: 'RETIRO' },
        { key: 'motivo_retiro', label: 'MOTIVO RETIRO' },
        { key: 'motivo_confidencial', label: 'CONFIDENCIAL' },
        { key: 'estado', label: 'ESTADO' },
        { key: 'lider', label: 'LIDER' },
        { key: 'aplica_dotacion', label: 'DOTACION' }
    ];

    const fetchExistingData = async () => {
        try {
            const response = await api.get('/etl/base-datos');
            if (response && response.success) {
                setExistingData(response.data);
            }
        } catch (err) { console.error("Error al cargar base de datos:", err); }
    };

    useEffect(() => { fetchExistingData(); }, []);

    const handleFileSelect = (selectedFile) => {
        setError(null); setResult(null); setPreviewData([]);
        if (!selectedFile) return;
        const validExt = /\.(xlsx|xls)$/i.test(selectedFile.name);
        if (!validExt) { setError('Formato inválido. Solo Excel (.xlsx, .xls)'); return; }
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // No limit on preview, show all records
                setPreviewData(jsonData);
            } catch (err) { console.error("Error preview:", err); }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.upload('/etl/upload/BASE_DATOS', formData);
            if (response && response.success) {
                setResult({ success: true, totalProcessed: response.processed, inserted: response.inserted });
                setFile(null); setPreviewData([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchExistingData();
            } else { setError(response?.message || 'Error en el servidor.'); }
        } catch (err) { setError('Error de conexión: ' + err.message); }
        finally { setLoading(false); }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="page page-container">
            <style>{`
                .base-layout { display: flex; flex-direction: column; gap: 2rem; }
                .base-header h2 { font-size: 1.8rem; font-weight: 700; color: #FFD700; margin: 0 0 0.5rem 0; }
                .base-header p { color: #9ca3af; margin: 0; }
                .base-main-grid { display: grid; grid-template-columns: 400px 1fr; gap: 2rem; align-items: start; }
                @media (max-width: 1200px) { .base-main-grid { grid-template-columns: 1fr; } }
                .base-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2rem; }
                .base-card h3 { color: #FFD700; font-size: 1.2rem; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.7rem; }
                .drop-zone { border: 2px dashed rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 2.5rem 1.5rem; text-align: center; cursor: pointer; transition: 0.3s; background: rgba(255, 215, 0, 0.02); }
                .drop-zone.drag-over { border-color: #FFD700; background: rgba(255, 215, 0, 0.08); }
                .drop-zone:hover { border-color: #FFD700; background: rgba(255, 215, 0, 0.08); }
                .btn-upload { width: 100%; margin-top: 1.5rem; padding: 1rem; background: #FFD700; color: #1C2A4A; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .btn-upload:disabled { background: #4b5563; color: #9ca3af; cursor: not-allowed; }
                .preview-section { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; min-height: 500px; }
                .preview-header { padding: 1.2rem 1.5rem; background: rgba(28, 42, 74, 0.5); border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; }
                .preview-header h4 { margin: 0; color: #FFD700; }
                .table-container { overflow: auto; max-height: 700px; }
                .excel-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #e2e8f0; background: #1a202c !important; }
                .excel-table th { position: sticky; top: 0; background: #111827 !important; padding: 0.8rem; text-align: left; border-bottom: 2px solid #FFD700; color: #FFD700; z-index: 10; white-space: nowrap; }
                .excel-table td { padding: 0.6rem 0.8rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); border-right: 1px solid rgba(255, 255, 255, 0.05); white-space: nowrap; background: #1a202c !important; color: #e2e8f0 !important; }
                .feedback-box { margin-top: 1.5rem; padding: 1rem; border-radius: 10px; font-size: 0.9rem; }
                .feedback-box.success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; }
                .feedback-box.error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
            `}</style>

            <div className="base-header">
                <h2>🗄️ Base de Datos Maestra</h2>
                <p>Gestión integral y carga masiva de información de empleados.</p>
            </div>

            <div className="base-layout">
                <div className="base-main-grid">
                    <div className="base-card">
                        <h3>📤 Carga de Archivo</h3>
                        <div
                            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁</div>
                            <p>{file ? file.name : 'Arrastra tu Excel aquí o haz clic'}</p>
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e.target.files[0])} />
                        </div>

                        <button className="btn-upload" onClick={handleUpload} disabled={loading || !file}>
                            {loading ? 'Subiendo...' : '🚀 Iniciar Carga Masiva'}
                        </button>

                        {result?.success && (
                            <div className="feedback-box success">
                                <b>✅ Carga exitosa</b><br/>
                                Registros Insertados/Actualizados: {result.inserted}
                            </div>
                        )}
                        {error && <div className="feedback-box error">❌ {error}</div>}

                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', fontSize: '0.8rem', color: '#93c5fd' }}>
                            <b>💡 Recomendación:</b> Asegúrate de que los títulos de las columnas en tu Excel coincidan con el formato requerido.
                        </div>
                    </div>

                    <div className="preview-section">
                        <div className="preview-header">
                            <h4>👀 {file ? 'Vista Previa (Excel)' : 'Registros en Sistema'}</h4>
                            <span>{(file ? previewData : existingData).length} registros</span>
                        </div>
                        <div className="table-container">
                            {(file ? previewData : existingData).length > 0 ? (
                                <table className="excel-table">
                                    <thead>
                                        <tr>
                                            {COLUMNS.map(col => <th key={col.key}>{col.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(file ? previewData : existingData).map((row, i) => (
                                            <tr key={i}>
                                                {COLUMNS.map(col => (
                                                    <td key={col.key}>
                                                        {file ? (row[col.label] || row[col.key.toUpperCase()] || row[col.key] || '') : (row[col.key] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '5rem', textAlign: 'center', color: '#718096' }}>
                                    No hay datos para mostrar. Seleccione un archivo o cargue información.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BaseDatos;
