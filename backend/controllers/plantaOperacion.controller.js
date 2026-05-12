const PlantaOperacion = require('../models/plantaOperacion.model');
const revalService = require('../services/reval.service');

const getAllPlantaOperaciones = async (req, res) => {
    try {
        const data = await PlantaOperacion.getAll();
        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error('Error in getAllPlantaOperaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los datos de la planta de operación',
            error: error.message
        });
    }
};

const createPlantaOperacion = async (req, res) => {
    try {
        console.log('🔥 CONTROLADOR CORRECTO EJECUTADO');
        
        // 1. Guardar en la base de datos local
        const result = await PlantaOperacion.create(req.body);

        // 2. Preparar datos para REVAL
        const { usuario_ad, nombre_completo, cedula } = req.body;
        
        // Mapeo solicitado por negocio
        const revalUserData = {
            username: usuario_ad || cedula,
            firstname: usuario_ad || 'Usuario',
            lastname: 'AD',
            password: 'Temp123!', // Valor dummy según requerimiento
            ou_path: 'OU=Usuarios,OU=Sac,DC=reval,DC=local',
            groups: ['SG_PTR_PLUS_PRODUCCION']
        };

        console.log('📤 Datos enviados a REVAL:', revalUserData);

        // 3. Consumir API externa
        let revalResult;
        try {
            console.log('🚀 Llamando a REVAL');
            revalResult = await revalService.createRevalUser(revalUserData);
        } catch (err) {
            console.error('[REVAL] Error en integración:', err.message);
            revalResult = { success: false, error: err.message };
        }

        res.status(201).json({
            success: true,
            message: 'Colaborador registrado exitosamente',
            id: result.insertId,
            reval: revalResult
        });
    } catch (error) {
        console.error('Error in createPlantaOperacion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar: ' + error.message,
            error: error.message
        });
    }
};

const getOficinaDetails = async (req, res) => {
    try {
        const { oficinaName } = req.params;
        const details = await PlantaOperacion.getOficinaDetails(oficinaName);
        
        if (!details) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron detalles para la oficina especificada'
            });
        }

        res.json({
            success: true,
            data: details
        });
    } catch (error) {
        console.error('Error in getOficinaDetails:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los detalles de la oficina',
            error: error.message
        });
    }
};

module.exports = {
    getAllPlantaOperaciones,
    createPlantaOperacion,
    getOficinaDetails
};
