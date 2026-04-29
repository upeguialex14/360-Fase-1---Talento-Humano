import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Listado completo de columnas según DB (39 campos editables)
 */
const ALL_COLUMNS = [
    { key: 'identificacion', label: 'Identificación', type: 'text', required: true },
    { key: 'nombre_apellido', label: 'Nombre y Apellido', type: 'text' },
    { key: 'fecha_ingreso', label: 'Fecha Ingreso', type: 'date' },
    { key: 'cargo', label: 'Cargo', type: 'text' },
    { key: 'tipo_contrato', label: 'Tipo Contrato', type: 'text' },
    { key: 'salario', label: 'Salario', type: 'number' },
    { key: 'empleador', label: 'Empleador', type: 'text' },
    { key: 'ciudad', label: 'Ciudad', type: 'text' },
    { key: 'zona', label: 'Zona', type: 'text' },
    { key: 'arl', label: 'ARL', type: 'text' },
    { key: 'detalle', label: 'Detalle', type: 'text' },
    { key: 'oficina', label: 'Oficina', type: 'text' },
    { key: 'unidad', label: 'Unidad', type: 'text' },
    { key: 'cliente', label: 'Cliente', type: 'text' },
    { key: 'centro_costos', label: 'Centro Costos', type: 'text' },
    { key: 'jefe', label: 'Jefe', type: 'text' },
    { key: 'correo_jefe', label: 'Correo Jefe', type: 'text' },
    { key: 'analista_encargado', label: 'Analista', type: 'text' },
    { key: 'poligrafia', label: 'Poligrafía', type: 'text' },
    { key: 'confirmacion_seleccion', label: 'Conf. Selección', type: 'text' },
    { key: 'anexos', label: 'Anexos', type: 'text' },
    { key: 'verificacion_documentos', label: 'Verif. Documentos', type: 'text' },
    { key: 'verificacion_anexos', label: 'Verif. Anexos', type: 'text' },
    { key: 'observaciones', label: 'Observaciones', type: 'text' },
    { key: 'fecha_retiro', label: 'Fecha Retiro', type: 'date' },
    { key: 'fin_prueba', label: 'Fin Prueba', type: 'date' },
    { key: 'dias_prueba', label: 'Días Prueba', type: 'number' },
    { key: 'celular', label: 'Celular', type: 'text' },
    { key: 'correo_electronico', label: 'Correo Electrónico', type: 'text' },
    { key: 'direccion', label: 'Dirección', type: 'text' },
    { key: 'ciudad_personal', label: 'Ciudad Personal', type: 'text' },
    { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date' },
    { key: 'fecha_expedicion_cc', label: 'Fecha Exp. CC', type: 'date' },
    { key: 'rh', label: 'RH', type: 'text' },
    { key: 'eps', label: 'EPS', type: 'text' },
    { key: 'ccf', label: 'CCF', type: 'text' },
    { key: 'afp', label: 'AFP', type: 'text' },
    { key: 'bh', label: 'BH', type: 'text' },
    { key: 'cuenta_bancaria', label: 'Cuenta Bancaria', type: 'text' },
];

const OrdenContratacion = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [modifiedIds, setModifiedIds] = useState(new Set());

    // Obtener permiso de edición para esta página
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

        // Validación: Identificación obligatoria para todos los modificados (especialmente nuevos)
        const missingIdent = modifiedRows.some(r => !r.identificacion || r.identificacion.toString().trim() === '');
        if (missingIdent) {
            alert('La identificación es obligatoria para todos los registros nuevos o modificados.');
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
                fetchRecords(); // Recargar para obtener IDs reales
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
        <div className="page orden-page">
            <style>{`
                .orden-page { padding: 1rem; display: flex; flex-direction: column; height: 100vh; }
                .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px; }
                .actions-group { display: flex; gap: 10px; }
                .btn-save { padding: 0.6rem 1.2rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                .btn-new { padding: 0.6rem 1.2rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                .btn-save:disabled, .btn-new:disabled { background: #ccc; cursor: not-allowed; }
                
                .table-container { flex: 1; overflow: auto; border: 1px solid #ddd; background: white; border-radius: 8px; }
                table { border-collapse: collapse; font-size: 0.85rem; min-width: 4500px; }
                th { position: sticky; top: 0; background: #f8f9fa; z-index: 10; padding: 12px 10px; border: 1px solid #dee2e6; text-align: left; white-space: nowrap; color: #495057; }
                td { padding: 4px 8px; border: 1px solid #dee2e6; white-space: nowrap; }
                
                .cell-input { width: 100%; border: 1px solid transparent; padding: 6px; background: transparent; border-radius: 3px; transition: all 0.2s; font-size: 0.85rem; }
                .cell-input:focus { background: white; border-color: #80bdff; outline: none; box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); }
                .cell-input:hover { border-color: #ddd; }
                
                .modified-row { background-color: #fff9db; }
                .is-new-row { background-color: #e7f5ff; }
                .modified-cell { border-left: 3px solid #fcc419 !important; }
                
                .error { color: #d32f2f; background: #ffebee; padding: 0.8rem; border-radius: 4px; margin-bottom: 1rem; }
                .success { color: #2e7d32; background: #e8f5e9; padding: 0.8rem; border-radius: 4px; margin-bottom: 1rem; }
                
                h1 { margin: 0; font-size: 1.5rem; color: #333; }
            `}</style>

            <div className="toolbar">
                <h1>Orden de Contratación</h1>
                <div className="actions-group">
                    <button className="btn-new" onClick={handleAddRow} disabled={loading || !canEdit}>
                        + Nueva Orden
                    </button>
                    <button
                        className="btn-save"
                        onClick={handleSave}
                        disabled={loading || modifiedIds.size === 0 || !canEdit}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {ALL_COLUMNS.map(col => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(row => (
                            <tr
                                key={row.id}
                                className={`${modifiedIds.has(row.id) ? 'modified-row' : ''} ${row.isNew ? 'is-new-row' : ''}`}
                            >
                                {ALL_COLUMNS.map(col => {
                                    const value = row[col.key];
                                    let displayValue = value || '';
                                    if (col.type === 'date' && displayValue && displayValue.includes('T')) {
                                        displayValue = displayValue.split('T')[0];
                                    }

                                    return (
                                        <td key={col.key} className={modifiedIds.has(row.id) ? 'modified-cell' : ''}>
                                            {col.type === 'select' ? (
                                                <select
                                                    className={`cell-input ${!canEdit ? 'disabled-input' : ''}`}
                                                    value={displayValue}
                                                    onChange={(e) => handleEdit(row.id, col.key, e.target.value)}
                                                    disabled={!canEdit}
                                                >
                                                    <option value="">--</option>
                                                    {col.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={col.type}
                                                    className={`cell-input ${!canEdit ? 'disabled-input' : ''}`}
                                                    value={displayValue}
                                                    onChange={(e) => handleEdit(row.id, col.key, e.target.value)}
                                                    placeholder={col.label}
                                                    readOnly={!canEdit}
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdenContratacion;
