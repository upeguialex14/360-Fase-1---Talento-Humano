const PlantaOperacion = require('../models/plantaOperacion.model');

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

module.exports = {
    getAllPlantaOperaciones
};
