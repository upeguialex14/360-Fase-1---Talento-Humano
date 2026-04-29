const uploadService = require('../../services/etl/masiveUploadExcel.service');
const CostCenterModel = require('../../models/etl/costCenter.model');
const BaseDatosModel = require('../../models/etl/BaseDatos.model');

const controllerUploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
        }

        // Preparacion de datos
        const data = {
            ...req.body,
            type: req.params.type,
            fileBuffer: req.file.buffer,
            mimetype: req.file.mimetype,
            fileName: req.file.filename,
            fileOriginalName: req.file.originalname
        };

        //Lamada al servicio donde esta la logica pasandole el documento con la info
        const newFile = await uploadService.uploadExcel(data);

        // respuesta exitosa del controlador
        return res.status(201).json(newFile);


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
