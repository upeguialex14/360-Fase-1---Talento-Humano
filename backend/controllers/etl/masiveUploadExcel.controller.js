const uploadService = require('../../services/etl/masiveUploadExcel.service');
const CostCenterModel = require('../../models/etl/costCenter.model');
const BaseDatosModel = require('../../models/etl/BaseDatos.model');

const controllerUploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
        }

        const type = req.params.type;
        const fileBuffer = req.file.buffer;

        const result = await uploadService.uploadExcel({ fileBuffer, type });

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Error en controllerUploadExcel:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getCostCenters = async (req, res) => {
    try {
        const data = await CostCenterModel.getAll();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error getCostCenters:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBaseDatos = async (req, res) => {
    try {
        const data = await BaseDatosModel.getAll();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error getBaseDatos:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { controllerUploadExcel, getCostCenters, getBaseDatos };
