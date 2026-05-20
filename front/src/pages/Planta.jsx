import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Toaster, toast } from 'sonner';
import './Planta.css';
const Planta = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Estados para edición
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Estados para los filtros
    const [filters, setFilters] = useState({
        nombre: '',
        cedula: '',
        contrato: '',
        cargo: '',
        tipo_empleado: '',
        regional: '',
        ciudad: '',
        cliente: '',
        empresa: '',
        estado: ''
    });

    // Opciones para los dropdowns (se llenarán dinámicamente)
    const [options, setOptions] = useState({
        contratos: [],
        cargos: [],
        tiposEmpleado: [],
        regionales: [],
        ciudades: [],
        clientes: [],
        empresas: [],
        estados: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/planta-operacion');
            if (response.success) {
                setData(response.data);
                setFilteredData(response.data);
                generateOptions(response.data);
            } else {
                setError(response.message || 'Error al cargar los datos');
            }
        } catch (err) {
            console.error("Error al obtener datos de planta:", err);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const generateOptions = (allData) => {
        const getUnique = (field) => {
            return [...new Set(allData.map(item => item[field]).filter(Boolean))].sort();
        };

        setOptions({
            contratos: getUnique('contrato'),
            cargos: getUnique('cargo'),
            tiposEmpleado: getUnique('tipo_empleado'),
            regionales: getUnique('regional'),
            ciudades: getUnique('ciudad'),
            clientes: getUnique('cliente'),
            empresas: getUnique('empresa'),
            estados: getUnique('estado')
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Lógica de filtrado
    useEffect(() => {
        const filtered = data.filter(item => {
            const matchNombre = !filters.nombre || (item.nombre && item.nombre.toLowerCase().includes(filters.nombre.toLowerCase()));
            const matchCedula = !filters.cedula || (item.cedula && item.cedula.toString().includes(filters.cedula));
            const matchContrato = !filters.contrato || item.contrato === filters.contrato;
            const matchCargo = !filters.cargo || item.cargo === filters.cargo;
            const matchTipoEmpleado = !filters.tipo_empleado || item.tipo_empleado === filters.tipo_empleado;
            const matchRegional = !filters.regional || item.regional === filters.regional;
            const matchCiudad = !filters.ciudad || item.ciudad === filters.ciudad;
            const matchCliente = !filters.cliente || item.cliente === filters.cliente;
            const matchEmpresa = !filters.empresa || item.empresa === filters.empresa;
            const matchEstado = !filters.estado || item.estado === filters.estado;

            return matchNombre && matchCedula && matchContrato && matchCargo && 
                   matchTipoEmpleado && matchRegional && matchCiudad && 
                   matchCliente && matchEmpresa && matchEstado;
        });
        setFilteredData(filtered);
    }, [filters, data]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            nombre: '',
            cedula: '',
            contrato: '',
            cargo: '',
            tipo_empleado: '',
            regional: '',
            ciudad: '',
            cliente: '',
            empresa: '',
            estado: ''
        });
    };

    // Funciones para edición
    const handleEdit = (row) => {
        setEditingRow(row);
        setEditFormData({ ...row });
        setEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const response = await api.put(`/planta-operacion/${editingRow.id_planta}`, editFormData);
            if (response.success) {
                const updatedData = data.map(item => item.id_planta === editingRow.id_planta ? { ...item, ...editFormData } : item);
                setData(updatedData);
                setEditModalOpen(false);
                toast.success('¡Registro actualizado exitosamente!');
            } else {
                toast.error('Error al guardar: ' + (response.message || 'Error desconocido'));
            }
        } catch (err) {
            console.error("Error updating record:", err);
            toast.error('Error de conexión con el servidor al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    // Columnas basadas en la estructura real de la tabla planta_operaciones
    const columns = [
        { key: 'acciones', label: 'Acciones' },
        { key: 'id_planta', label: 'ID' },
        { key: 'empleador', label: 'Empleador' },
        { key: 'cedula', label: 'Cédula' },
        { key: 'nombre', label: 'Nombre Completo' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'fecha_ingreso', label: 'Fecha Ingreso' },
        { key: 'contrato', label: 'Contrato' },
        { key: 'tipo_empleado', label: 'Tipo Empleado' },
        { key: 'regional', label: 'Regional' },
        { key: 'zona', label: 'Zona' },
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'unidad_negocio', label: 'Unidad Negocio' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'empresa', label: 'Empresa' },
        { key: 'codigo_ptr', label: 'Cód. PTR' },
        { key: 'cc_helisa', label: 'CC Helisa' },
        { key: 'oficina', label: 'Oficina' },
        { key: 'vacante_sobrante', label: 'Vacante/Sob.' },
        { key: 'planta_aprobada', label: 'Planta Aprob.' },
        { key: 'supervisor_gerente', label: 'Supervisor/Gerente' },
        { key: 'status', label: 'Status' },
        { key: 'novedad', label: 'Novedad' },
        { key: 'motivo_retiro', label: 'Motivo Retiro' },
        { key: 'fecha_inicial', label: 'Fecha Inicial' },
        { key: 'fecha_final', label: 'Fecha Final' },
        { key: 'fecha_retiro', label: 'Fecha Retiro' },
        { key: 'traslado_oficina_destino', label: 'Destino Traslado' },
        { key: 'dias_ausencia', label: 'Días Ausencia' },
        { key: 'observacion', label: 'Observación' },
        { key: 'jornada', label: 'Jornada' },
        { key: 'correo', label: 'Correo' },
        { key: 'correo_corp', label: 'Correo Corporativo' },
        { key: 'usuario_ad', label: 'Usuario AD' },
        { key: 'estado', label: 'Estado' },
        { key: 'banco', label: 'Banco' },
        { key: 'cuenta_bancaria', label: 'Cuenta' },
        { key: 'tipo_cuenta', label: 'Tipo Cuenta' }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('es-ES');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="page page-container">
            <Toaster position="top-center" richColors />
            <div className="planta-header">
                <h2>🏭 Planta de Operación</h2>
                <p>Visualización detallada de todo el personal operativo en formato Excel.</p>
            </div>

            <div className="planta-layout">
                <div className="planta-card">
                    <div className="planta-toolbar">
                        <div className="toolbar-left">
                            <h3>📊 Registros de Planta</h3>
                            {!loading && data.length > 0 && (
                                <span className="planta-stats">
                                    Total registros: <strong>{data.length}</strong> {filteredData.length !== data.length && `(Filtrados: ${filteredData.length})`}
                                </span>
                            )}
                        </div>
                        <div className="toolbar-right">
                            <button 
                                className={`btn-filter ${showFilters ? 'active' : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                🔍 {showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="filters-panel">
                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label>Cédula</label>
                                    <input 
                                        type="text" 
                                        name="cedula" 
                                        placeholder="Buscar por cédula..." 
                                        value={filters.cedula}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Nombre</label>
                                    <input 
                                        type="text" 
                                        name="nombre" 
                                        placeholder="Buscar por nombre..." 
                                        value={filters.nombre}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Contrato</label>
                                    <select name="contrato" value={filters.contrato} onChange={handleFilterChange}>
                                        <option value="">Todos los contratos</option>
                                        {options.contratos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Cargo</label>
                                    <select name="cargo" value={filters.cargo} onChange={handleFilterChange}>
                                        <option value="">Todos los cargos</option>
                                        {options.cargos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Tipo Empleado</label>
                                    <select name="tipo_empleado" value={filters.tipo_empleado} onChange={handleFilterChange}>
                                        <option value="">Todos los tipos</option>
                                        {options.tiposEmpleado.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Regional</label>
                                    <select name="regional" value={filters.regional} onChange={handleFilterChange}>
                                        <option value="">Todas las regionales</option>
                                        {options.regionales.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Ciudad</label>
                                    <select name="ciudad" value={filters.ciudad} onChange={handleFilterChange}>
                                        <option value="">Todas las ciudades</option>
                                        {options.ciudades.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Cliente</label>
                                    <select name="cliente" value={filters.cliente} onChange={handleFilterChange}>
                                        <option value="">Todos los clientes</option>
                                        {options.clientes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Estado</label>
                                    <select name="estado" value={filters.estado} onChange={handleFilterChange}>
                                        <option value="">Todos los estados</option>
                                        {options.estados.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="filter-actions">
                                    <button className="btn-reset" onClick={resetFilters}>Limpiar Filtros</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="excel-container">
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Cargando información de la base de datos...</p>
                            </div>
                        ) : error ? (
                            <div className="empty-state">
                                <span className="icon">⚠️</span>
                                <p>{error}</p>
                                <button 
                                    className="btn-upload" 
                                    style={{ width: 'auto', padding: '0.5rem 1.5rem', marginTop: '1rem' }}
                                    onClick={fetchData}
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : filteredData.length > 0 ? (
                            <table className="excel-table">
                                <thead>
                                    <tr>
                                        {columns.map(col => (
                                            <th key={col.key}>{col.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={row.id_planta || index}>
                                            {columns.map(col => {
                                                const value = row[col.key];
                                                const isDate = col.key.startsWith('fecha');
                                                return (
                                                    <td key={col.key}>
                                                        {col.key === 'acciones' ? (
                                                            <button 
                                                                className="btn-edit" 
                                                                style={{ padding: '0.3rem 0.5rem', background: '#FFCD04', color: '#2A2A54', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                onClick={() => handleEdit(row)}
                                                                title="Editar registro"
                                                            >
                                                                ✏️
                                                            </button>
                                                        ) : isDate ? formatDate(value) : (value ?? '-')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <span className="icon">📂</span>
                                <p>No se encontraron registros que coincidan con los filtros.</p>
                                <button className="btn-reset" style={{ marginTop: '1rem' }} onClick={resetFilters}>Limpiar Filtros</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Edición */}
            {editModalOpen && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <div className="edit-modal-header">
                            <h3>✏️ Editar Registro</h3>
                            <button className="btn-close-modal" onClick={() => setEditModalOpen(false)}>×</button>
                        </div>
                        <div className="edit-form-grid">
                            {columns.filter(c => c.key !== 'acciones' && c.key !== 'id_planta').map(col => (
                                <div key={col.key} className="edit-form-group">
                                    <label>{col.label}</label>
                                    <input 
                                        type={col.key.startsWith('fecha') ? 'date' : 'text'}
                                        name={col.key}
                                        value={editFormData[col.key] ? (col.key.startsWith('fecha') && editFormData[col.key] ? new Date(editFormData[col.key]).toISOString().split('T')[0] : editFormData[col.key]) : ''}
                                        onChange={handleEditChange}
                                        className="edit-input"
                                        placeholder={`Ingresa ${col.label.toLowerCase()}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="edit-modal-actions">
                            <button 
                                className="btn-edit-cancel"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={`btn-edit-save ${isSaving ? 'saving' : ''}`}
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <><span className="save-spinner"></span> Guardando...</>
                                ) : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Planta;
