import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CargaExcel = () => {
    const [tipo, setTipo] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // Estado para el modal de columnas
    const [showModal, setShowModal] = useState(false);
    const [availableColumns, setAvailableColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState(new Set());
    const [excelData, setExcelData] = useState([]);

    const [historial, setHistorial] = useState(() => {
        const stored = localStorage.getItem('historial_cargas');
        return stored ? JSON.parse(stored) : [];
    });

    const token = localStorage.getItem('token');

    // Columnas administrativas solicitadas (23)
    const adminCols = [
        "Identificación", "Nombre y Apellido", "Fecha de ingreso", "Cargo", "Tipo de contrato",
        "Detalle", "Oficina", "Empleador", "Unidad", "Ciudad", "Zona", "Cliente",
        "Centro de Costos", "Jefe", "Correo Jefe", "Analista Encargado", "Poligrafia",
        "Confirmación Selección", "Anexos", "Verificación Documentos", "Verificación Anexos", "Observaciones"
    ];

    // Columnas información persona (16)
    const personalCols = [
        "Fecha de Retiro", "Fin de Prueba", "Dias prueba", "Salario", "ARL", "Celular",
        "Correo electronico", "Direccion", "Ciudad", "Fecha de nacimiento",
        "Fecha expedicion CC", "RH", "EPS", "CCF", "AFP", "BH", "Cuenta Bancaria"
    ];


    // Mapeo de nombres UI a nombres DB (backend usa estos)
    const colMapping = {
        "Identificación": "identificacion",
        "Nombre y Apellido": "nombre_apellido",
        "Fecha de ingreso": "fecha_ingreso",
        "Cargo": "cargo",
        "Tipo de contrato": "tipo_contrato",
        "Detalle": "detalle",
        "Oficina": "oficina",
        "Empleador": "empleador",
        "Unidad": "unidad",
        "Ciudad": "ciudad",
        "Zona": "zona",
        "Cliente": "cliente",
        "Centro de Costos": "centro_costos",
        "Jefe": "jefe",
        "Correo Jefe": "correo_jefe",
        "Analista Encargado": "analista_encargado",
        "Poligrafia": "poligrafia",
        "Confirmación Selección": "confirmacion_seleccion",
        "Anexos": "anexos",
        "Verificación Documentos": "verificacion_documentos",
        "Verificación Anexos": "verificacion_anexos",
        "Observaciones": "observaciones",
        "Fecha de Retiro": "fecha_retiro",
        "Fin de Prueba": "fin_prueba",
        "Dias prueba": "dias_prueba",
        "Salario": "salario",

        "ARL": "arl",
        "Celular": "celular",
        "Correo electronico": "correo_electronico",
        "Direccion": "direccion",
        "Fecha de nacimiento": "fecha_nacimiento",
        "Fecha expedicion CC": "fecha_expedicion_cc",
        "RH": "rh",
        "EPS": "eps",
        "CCF": "ccf",
        "AFP": "afp",
        "BH": "bh",
        "Cuenta Bancaria": "cuenta_bancaria"
    };

    // Helper para normalizar strings (quitar tildes, minúsculas, limpiar espacios)
    const normalizeString = (str) => {
        if (!str) return "";
        return str
            .toString()
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/gi, "")
            .replace(/\s+/g, " ");
    };

    // Estado para mapear etiquetas UI a cabeceras reales del Excel
    const [excelHeaderMap, setExcelHeaderMap] = useState({});

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile || null);
        setError(null);

        if (selectedFile && tipo === 'orden_contratacion') {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target.result;
                    const wb = window.XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = window.XLSX.utils.sheet_to_json(ws, { defval: "" });

                    if (data.length > 0) {
                        const excelHeaders = Object.keys(data[0]);
                        const normalizedExcel = excelHeaders.map(h => ({ original: h, normalized: normalizeString(h) }));

                        // Listas de alias o variaciones comunes para mejorar la detección
                        const aliases = {
                            "Identificación": ["identificacion", "id", "cedula", "cc", "documento"],
                            "Nombre y Apellido": ["nombre y apellido", "nombre completo", "nombres y apellidos", "empleado"],
                            "Fecha de ingreso": ["fecha de ingreso", "fecha ingreso", "ingreso"],
                            "Cargo": ["cargo", "puesto", "oficio"],
                            "Tipo de contrato": ["tipo de contrato", "contrato", "tipo contrato"],
                            "Detalle": ["detalle", "justificacion", "motivo", "detalle la justificacion para el cubrimiento de la vacante"],
                            "Oficina": ["oficina", "sucursal"],
                            "Empleador": ["empleador", "empresa"],
                            "Unidad": ["unidad", "area", "departamento"],
                            "Ciudad": ["ciudad", "municipio"],
                            "Zona": ["zona", "region"],
                            "Cliente": ["cliente", "proyecto"],
                            "Centro de Costos": ["centro de costos", "centro de costo", "ceco", "costo"],
                            "Jefe": ["jefe", "jefe inmediato", "lider", "responsable"],
                            "Correo Jefe": ["correo jefe", "correo lider", "email jefe"],
                            "Analista Encargado": ["analista", "analista encargado"],
                            "Poligrafia": ["poligrafia"],
                            "Confirmación Selección": ["confirmacion seleccion", "seleccion", "confirmacion seleccion"],
                            "Anexos": ["anexos", "documentos anexos", "anexos empresariales", "examenes", "estudio seguridad"],
                            "Verificación Documentos": ["verificación documentos", "documentos personales", "verificacion documentos"],
                            "Verificación Anexos": ["verificación anexos", "anexos", "verificacion anexos"],
                            "Observaciones": ["observaciones", "notas"],
                            "Fecha de Retiro": ["fecha de retiro", "fecha retiro", "retiro", "fecha retiro fijo"],

                            "Fin de Prueba": ["fin de prueba", "fin periodo de prueba", "termino prueba"],
                            "Dias prueba": ["dias prueba", "dias periodo de prueba", "dias", "dias pruebas"],
                            "Salario": ["salario", "sueldo", "basico"],

                            "ARL": ["arl"],
                            "Celular": ["celular", "telefono", "movil"],
                            "Correo electronico": ["correo electronico", "email", "correo"],
                            "Direccion": ["direccion", "residencia"],
                            "Fecha de nacimiento": ["fecha de nacimiento", "nacimiento"],
                            "Fecha expedicion CC": ["fecha expedicion cc", "expedicion"],
                            "RH": ["rh", "sangre"],
                            "EPS": ["eps"],
                            "CCF": ["ccf", "caja", "compensacion"],
                            "AFP": ["afp", "pension"],
                            "BH": ["bh"],
                            "Cuenta Bancaria": ["cuenta bancaria", "banco", "cuenta"]
                        };

                        const newMap = {};
                        const allOfficial = [...adminCols, ...personalCols];

                        allOfficial.forEach(officialName => {
                            const normOfficial = normalizeString(officialName);
                            const officialAliases = aliases[officialName] || [];

                            // Intentar encontrar coincidencia en Excel
                            const match = normalizedExcel.find(ex => {
                                // Coincidencia exacta normalizada
                                if (ex.normalized === normOfficial) return true;
                                // Coincidencia con alias
                                return officialAliases.some(alias => normalizeString(alias) === ex.normalized);
                            });

                            if (match) {
                                newMap[officialName] = match.original;
                            }
                        });

                        setExcelHeaderMap(newMap);
                        setAvailableColumns(excelHeaders);
                        setExcelData(data);
                        setShowModal(true);
                    } else {
                        setError('El archivo está vacío.');
                    }
                } catch (err) {
                    setError('Error al leer el archivo Excel: ' + err.message);
                }
            };
            reader.readAsBinaryString(selectedFile);
        }
    };


    const toggleColumn = (col) => {
        setSelectedColumns(prev => {
            const next = new Set(prev);
            if (next.has(col)) next.delete(col);
            else next.add(col);
            return next;
        });
    };

    const toggleAllFromFile = () => {
        const detectedOfficially = Object.keys(excelHeaderMap);
        const allDetectedSelected = detectedOfficially.every(c => selectedColumns.has(c));
        const next = new Set(selectedColumns);
        if (allDetectedSelected) {
            detectedOfficially.forEach(c => next.delete(c));
        } else {
            detectedOfficially.forEach(c => next.add(c));
        }
        setSelectedColumns(next);
    };


    const toggleAdmin = () => {
        const allAdminSelected = adminCols.every(c => selectedColumns.has(c));
        const next = new Set(selectedColumns);
        if (allAdminSelected) {
            adminCols.forEach(c => next.delete(c));
        } else {
            adminCols.forEach(c => next.add(c));
        }
        setSelectedColumns(next);
    };

    const togglePersonal = () => {
        const allPersonalSelected = personalCols.every(c => selectedColumns.has(c));
        const next = new Set(selectedColumns);
        if (allPersonalSelected) {
            personalCols.forEach(c => next.delete(c));
        } else {
            personalCols.forEach(c => next.add(c));
        }
        setSelectedColumns(next);
    };



    const handleConfirmCarga = async () => {
        // VALIDACIONES OBLIGATORIAS
        if (!selectedColumns.has("Identificación")) {
            alert('La columna "Identificación" debe estar seleccionada.');
            return;
        }

        // 2) Filtrar las columnas que no existen en el Excel para evitar errores
        const validSelected = Array.from(selectedColumns).filter(c => excelHeaderMap[c]);

        if (validSelected.length === 0) {
            alert('No hay columnas válidas seleccionadas para cargar.');
            return;
        }

        setShowModal(false);
        setLoading(true);

        // Preparar registros para enviar
        const recordsToSend = excelData.map(row => {
            const cleanRow = {};
            validSelected.forEach(colUI => {
                const excelHeader = excelHeaderMap[colUI];
                const dbKey = colMapping[colUI] || colUI;
                cleanRow[dbKey] = row[excelHeader];
            });
            return cleanRow;
        });

        try {
            const data = await api.post('/orden-contratacion/upsert', {
                records: recordsToSend,
                selectedColumns: validSelected.map(c => colMapping[c] || c)
            });

            if (data.success) {

                setMessage('Carga completada: ' + data.message);
                updateSimulatedHistory('orden_contratacion', file.name, 'aceptado', recordsToSend.length);
            } else {
                setError(data.message);
                updateSimulatedHistory('orden_contratacion', file.name, 'rechazado', 0, data.message);
            }
        } catch (err) {
            setError('Error en el servidor: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateSimulatedHistory = (tipo, filename, estado, total, error = '') => {
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
            mensaje_detalle: error
        };
        const newList = [record, ...historial];
        setHistorial(newList);
        localStorage.setItem('historial_cargas', JSON.stringify(newList));
    };

    const handleSubmitLegacy = async (e) => {
        e.preventDefault();
        if (tipo === 'orden_contratacion') return; // Se maneja vía modal

        if (!tipo || !file) {
            setError('Complete todos los campos.');
            return;
        }

        // Simulación original para otros tipos
        setLoading(true);
        setTimeout(() => {
            updateSimulatedHistory(tipo, file.name, 'aceptado', 100);
            setMessage('Archivo procesado satisfactoriamente (Simulado)');
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="page carga-page">
            <style>{`
                .carga-page { padding: 1rem; }
                .carga-form { display: flex; flex-direction: column; gap: 1rem; max-width: 450px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .carga-form label { font-weight: bold; margin-bottom: 0.2rem; }
                .carga-form select, .carga-form input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
                .btn-submit { background: #007bff; color: white; border: none; padding: 0.8rem; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 1rem; }
                .btn-submit:disabled { background: #ccc; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: white; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 2rem; border-radius: 12px; }
                .col-groups { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1.5rem 0; }
                .group-box { padding: 1rem; border-radius: 8px; border: 1px solid #ddd; }
                .group-yellow { background: #fffde7; border-color: #fdd835; }
                .group-green { background: #e8f5e9; border-color: #4caf50; }
                .col-list { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 1rem; font-size: 0.85rem; }
                .col-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
                .actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
                .btn-group { font-size: 0.8rem; padding: 0.3rem 0.6rem; margin-bottom: 1rem; cursor: pointer; border: 1px solid #666; background: white; border-radius: 4px; }
                
                .history-table { margin-top: 2rem; overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; background: white; }
                th, td { padding: 0.8rem; border: 1px solid #eee; text-align: left; }
                th { background: #fafafa; }
                .error { color: #d32f2f; background: #ffebee; padding: 0.5rem; border-radius: 4px; }
                .success { color: #2e7d32; background: #e8f5e9; padding: 0.5rem; border-radius: 4px; }
            `}</style>

            <h1>Carga Excel</h1>

            <form className="carga-form" onSubmit={handleSubmitLegacy}>
                <label>Tipo de carga *</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={loading}>
                    <option value="">-- Seleccione --</option>
                    <option value="orden_contratacion">Orden de contratación</option>
                    <option value="trabajadores">Trabajadores</option>
                    <option value="ausencias">Ausencias</option>
                    <option value="nomina">Nómina</option>
                </select>

                <label>Archivo Excel *</label>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={loading} />

                <button type="submit" className="btn-submit" disabled={loading || tipo === 'orden_contratacion'}>
                    {loading ? 'Procesando...' : 'Cargar'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            {/* MODAL DE SELECCIÓN DE COLUMNAS */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Configuración de Carga Especial</h2>
                        <p>Seleccione las columnas que desea procesar del archivo.</p>

                        <button onClick={toggleAllFromFile} className="btn-group">Seleccionar todas del archivo</button>


                        <div className="col-groups">
                            <div className="group-box group-yellow">
                                <h3>Columnas Administrativas (23)</h3>
                                <button onClick={toggleAdmin} className="btn-group">Seleccionar todas Administrativas</button>

                                <div className="col-list">
                                    {adminCols.map(c => (
                                        <label key={c} className="col-item">
                                            <input type="checkbox" checked={selectedColumns.has(c)} onChange={() => toggleColumn(c)} />

                                            <span style={{ color: excelHeaderMap[c] ? 'black' : '#999' }}>
                                                {c} {excelHeaderMap[c] ? `(${excelHeaderMap[c]})` : '(No detectada)'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="group-box group-green">
                                <h3>Columnas Información Persona (16)</h3>
                                <button onClick={togglePersonal} className="btn-group">Seleccionar todas Información Personal</button>

                                <div className="col-list">
                                    {personalCols.map(c => (
                                        <label key={c} className="col-item">
                                            <input type="checkbox" checked={selectedColumns.has(c)} onChange={() => toggleColumn(c)} />

                                            <span style={{ color: excelHeaderMap[c] ? 'black' : '#999' }}>
                                                {c} {excelHeaderMap[c] ? `(${excelHeaderMap[c]})` : '(No detectada)'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="actions">
                            <button onClick={() => setShowModal(false)} className="btn-group">Cancelar</button>
                            <button onClick={handleConfirmCarga} className="btn-submit" style={{ margin: 0 }}>Confirmar carga</button>
                        </div>
                    </div>
                </div>
            )}

            {/* HISTORIAL */}
            <div className="history-table">
                <h2>Historial de cargas</h2>
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
                                <td>{r.tipo}</td>
                                <td>{r.filename}</td>
                                <td>{r.estado}</td>
                                <td>{r.registros_procesados}</td>
                                <td>{new Date(r.fecha_inicio_proceso).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CargaExcel;
