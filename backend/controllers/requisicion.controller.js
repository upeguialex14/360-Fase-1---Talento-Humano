const Requisicion = require('../models/requisicion.model');

// Festivos de Colombia (2025-2026)
const FESTIVOS_COLOMBIA = [
    // 2025
    '2025-01-01', // Año Nuevo
    '2025-01-06', // Reyes Magos
    '2025-03-24', // Lunes Santo
    '2025-04-18', // Viernes Santo
    '2025-05-01', // Día del Trabajo
    '2025-05-11', // Ascensión del Señor
    '2025-06-02', // Corpus Christi
    '2025-06-23', // Sagrado Corazón
    '2025-06-30', // San Pedro y San Pablo
    '2025-07-20', // Independencia
    '2025-08-07', // Batalla de Boyacá
    '2025-08-15', // Asunción
    '2025-10-13', // Día de la Raza
    '2025-11-03', // Todos los Santos
    '2025-11-17', // Independencia de Cartagena
    '2025-12-08', // Inmaculada Concepción
    '2025-12-25', // Navidad
    // 2026
    '2026-01-01', // Año Nuevo
    '2026-01-05', // Reyes Magos
    '2026-04-03', // Lunes Santo
    '2026-04-10', // Viernes Santo
    '2026-05-01', // Día del Trabajo
    '2026-05-17', // Ascensión del Señor
    '2026-06-08', // Corpus Christi
    '2026-06-29', // Sagrado Corazón
    '2026-06-30', // San Pedro y San Pablo
    '2026-07-20', // Independencia
    '2026-08-07', // Batalla de Boyacá
    '2026-08-17', // Asunción
    '2026-10-12', // Día de la Raza
    '2026-11-02', // Todos los Santos
    '2026-11-16', // Independencia de Cartagena
    '2026-12-08', // Inmaculada Concepción
    '2026-12-25', // Navidad
];

// Función para verificar si es festivo
function esFestivo(fecha) {
    const fechaStr = fecha.toISOString().split('T')[0];
    return FESTIVOS_COLOMBIA.includes(fechaStr);
}

// Función para verificar si es fin de semana (sábado = 6, domingo = 0)
function esFinDeSemana(fecha) {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6;
}

// Función para calcular días hábiles (lunes a viernes, excluyendo festivos)
function calcularDiasHabiles(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return 0;
    
    let fecha = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    let diasHabiles = 0;
    
    // Si la hora de inicio es después de las 12:00 PM, empezar desde el día siguiente
    if (fecha.getHours() >= 12) {
        fecha.setDate(fecha.getDate() + 1);
    }
    
    // Normalizar a medianoche para comparar solo fechas
    fecha.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);
    
    while (fecha <= fin) {
        if (!esFinDeSemana(fecha) && !esFestivo(fecha)) {
            diasHabiles++;
        }
        fecha.setDate(fecha.getDate() + 1);
    }
    
    return diasHabiles;
}

// Función para calcular porcentaje de cumplimiento
function calcularPorcentajeCumplimiento(diasHabiles) {
    if (diasHabiles <= 0) return 100;
    if (diasHabiles <= 5) return 100;
    if (diasHabiles <= 10) return 95;
    if (diasHabiles <= 15) return 80;
    if (diasHabiles <= 20) return 70;
    if (diasHabiles <= 25) return 60;
    if (diasHabiles <= 30) return 50;
    return Math.max(30, 100 - (diasHabiles * 2));
}

// Obtener todas las requisiciones
exports.getAll = async (req, res) => {
    try {
        const { estado, busqueda } = req.query;
        const user = req.user;
        
        // Determinar filtros según el rol
        let filters = {};
        
        // Rol 1 = Administrador, ve todo
        // Rol ANALISTA_LIDER = ve todo pero puede asignar
        // Rol ANALISTA = solo ve las asignadas
        
        if (user.role_id !== 1 && user.role_code !== 'ANALISTA_LIDER') {
            // Si es analista normal, solo ve las asignadas
            filters.analista_id = user.user_id;
        }
        
        if (estado) filters.estado = estado;
        if (busqueda) filters.busqueda = busqueda;
        
        const requisiciones = await Requisicion.getAll(filters);
        
        // Calcular días de mora y porcentaje de cumplimiento para cada requisición
        const requisicionesConMetricas = requisiciones.map(req => {
            const diasHabiles = calcularDiasHabiles(req.fecha_llegada, new Date());
            const diasMora = diasHabiles > 10 ? diasHabiles - 10 : 0;
            const porcentajeCumplimiento = calcularPorcentajeCumplimiento(diasHabiles);
            
            return {
                ...req,
                dias_habiles: diasHabiles,
                dias_mora: diasMora,
                porcentaje_cumplimiento: porcentajeCumplimiento
            };
        });
        
        res.json({
            success: true,
            data: requisicionesConMetricas
        });
    } catch (err) {
        console.error('[RequisicionController] Error getting requisiciones:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las requisiciones'
        });
    }
};

// Obtener requisición por ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const requisicion = await Requisicion.getById(id);
        
        if (!requisicion) {
            return res.status(404).json({
                success: false,
                message: 'Requisición no encontrada'
            });
        }
        
        // Calcular métricas
        const diasHabiles = calcularDiasHabiles(requisicion.fecha_llegada, new Date());
        const diasMora = diasHabiles > 10 ? diasHabiles - 10 : 0;
        const porcentajeCumplimiento = calcularPorcentajeCumplimiento(diasHabiles);
        
        res.json({
            success: true,
            data: {
                ...requisicion,
                dias_habiles: diasHabiles,
                dias_mora: diasMora,
                porcentaje_cumplimiento: porcentajeCumplimiento
            }
        });
    } catch (err) {
        console.error('[RequisicionController] Error getting requisicion:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la requisición'
        });
    }
};

// Crear requisición
exports.create = async (req, res) => {
    try {
        const data = req.body;
        data.solicitante_id = req.user.user_id;
        
        const id = await Requisicion.create(data);
        
        if (!id) {
            return res.status(500).json({
                success: false,
                message: 'Error al crear la requisición'
            });
        }
        
        res.json({
            success: true,
            message: 'Requisición creada correctamente',
            data: { id }
        });
    } catch (err) {
        console.error('[RequisicionController] Error creating requisicion:', err);
        res.status(500).json({
            success: false,
            message: 'Error al crear la requisición'
        });
    }
};

// Actualizar requisición
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const success = await Requisicion.update(id, data);
        
        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar la requisición'
            });
        }
        
        res.json({
            success: true,
            message: 'Requisición actualizada correctamente'
        });
    } catch (err) {
        console.error('[RequisicionController] Error updating requisicion:', err);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la requisición'
        });
    }
};

// Eliminar requisición
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        const success = await Requisicion.delete(id);
        
        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar la requisición'
            });
        }
        
        res.json({
            success: true,
            message: 'Requisición eliminada correctamente'
        });
    } catch (err) {
        console.error('[RequisicionController] Error deleting requisicion:', err);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la requisición'
        });
    }
};

// Obtener estadísticas para dashboard
exports.getEstadisticas = async (req, res) => {
    try {
        const user = req.user;
        
        // Solo analistas y admins ven estadísticas
        let analista_id = null;
        if (user.role_id !== 1 && user.role_code !== 'ANALISTA_LIDER') {
            analista_id = user.user_id;
        }
        
        const estadisticas = await Requisicion.getEstadisticas(analista_id);
        
        res.json({
            success: true,
            data: estadisticas
        });
    } catch (err) {
        console.error('[RequisicionController] Error getting estadisticas:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadísticas'
        });
    }
};

// Obtener analistas disponibles
exports.getAnalistas = async (req, res) => {
    try {
        const analistas = await Requisicion.getAnalistas();
        
        res.json({
            success: true,
            data: analistas
        });
    } catch (err) {
        console.error('[RequisicionController] Error getting analistas:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los analistas'
        });
    }
};

// Exportar requisiciones a CSV
exports.exportarCSV = async (req, res) => {
    try {
        const { estado, busqueda } = req.query;
        const user = req.user;
        
        let filters = {};
        if (user.role_id !== 1 && user.role_code !== 'ANALISTA_LIDER') {
            filters.analista_id = user.user_id;
        }
        if (estado) filters.estado = estado;
        if (busqueda) filters.busqueda = busqueda;
        
        const requisiciones = await Requisicion.getAll(filters);
        
        // Crear CSV
        const headers = ['N° Req', 'F. Llegada', 'Mes', 'Empresa', 'Cliente', 'Regional', 'U. Negocio', 'Zona', 'Cargo', 'Cantidad', 'Tipo Contrato', 'Estado', 'Días Mora', '% Cump.'];
        const rows = requisiciones.map(req => {
            const diasHabiles = calcularDiasHabiles(req.fecha_llegada, new Date());
            const diasMora = diasHabiles > 10 ? diasHabiles - 10 : 0;
            const porcentajeCumplimiento = calcularPorcentajeCumplimiento(diasHabiles);
            
            return [
                req.codigo_req,
                req.fecha_llegada ? new Date(req.fecha_llegada).toLocaleDateString('es-CO') : '',
                req.mes || '',
                req.empresa || '',
                req.cliente || '',
                req.regional || '',
                req.unidad_negocio || '',
                req.zona || '',
                req.cargo || '',
                req.cantidad || '',
                req.tipo_contrato || '',
                req.estado || '',
                diasMora,
                `${porcentajeCumplimiento}%`
            ];
        });
        
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=requisiciones.csv');
        res.send(csv);
    } catch (err) {
        console.error('[RequisicionController] Error exporting CSV:', err);
        res.status(500).json({
            success: false,
            message: 'Error al exportar el CSV'
        });
    }
};