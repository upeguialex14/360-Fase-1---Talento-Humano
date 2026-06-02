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
            fileOriginalName: req.file.originalname,
            username: req.user?.login || 'Sistema'
        };

        //Llamada al servicio donde esta la logica pasandole el documento con la info
        const newFile = await uploadService.uploadExcel(data);

        // respuesta exitosa del controlador
        return res.status(201).json(newFile);


    } catch (error) {
        console.error("Error controllerUploadExcel:", error);
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

const deleteAllCostCenters = async (req, res) => {
    try {
        const db = require('../../config/db');
        await db.query('DELETE FROM cost_center');
        return res.status(200).json({ success: true, message: 'Registros eliminados' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAllOffices = async (req, res) => {
    try {
        const db = require('../../config/db');
        await db.execute('SET FOREIGN_KEY_CHECKS = 0');
        await db.execute('DELETE FROM master_offices');
        await db.execute('SET FOREIGN_KEY_CHECKS = 1');
        return res.status(200).json({ success: true, message: 'Todos los registros de oficinas han sido eliminados correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAllBaseDatos = async (req, res) => {
    const connection = await require('../../config/db').getConnection();
    try {
        await connection.beginTransaction();
        
        // El orden es importante para evitar errores de llaves foraneas
        await connection.query('DELETE FROM people_extended_info');
        await connection.query('DELETE FROM people_healt_security');
        await connection.query('DELETE FROM people');
        await connection.query('DELETE FROM people_details');
        await connection.query('DELETE FROM business_people_data');
        
        await connection.commit();
        return res.status(200).json({ success: true, message: 'Todos los registros de la base de datos han sido eliminados correctamente' });
    } catch (error) {
        await connection.rollback();
        console.error("Error deleteAllBaseDatos:", error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

const getOffices = async (req, res) => {
    try {
        const db = require('../../config/db');
        const [rows] = await db.execute(`
            SELECT 
                o.office_id, 
                o.name as OFICINA,
                c.name as CIUDAD,
                a.name as ZONA,
                r.name as REGIONAL,
                CONCAT(u.name, ' ', u.last_name) as LIDER
            FROM master_offices o
            LEFT JOIN master_cities c ON o.id_ciudad = c.city_id
            LEFT JOIN master_area a ON o.zona_id = a.area_id
            LEFT JOIN master_regional r ON o.id_regional = r.regional_id
            LEFT JOIN master_leader ml ON o.leader_id = ml.leader_id
            LEFT JOIN users u ON ml.user_id = u.user_id
            ORDER BY o.office_id DESC
        `);
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error getOffices:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateBaseDatosSizes = async (req, res) => {
    try {
        const { cedula, t_camisa, t_pantalon, t_zapatos } = req.body;
        if (!cedula) {
            return res.status(400).json({ success: false, message: 'La cédula es requerida' });
        }
        const updated = await BaseDatosModel.updateSizes(cedula, t_camisa, t_pantalon, t_zapatos);
        if (updated) {
            return res.status(200).json({ success: true, message: 'Tallas de colaborador actualizadas en base de datos' });
        } else {
            return res.status(404).json({ success: false, message: 'Colaborador no encontrado en la base de datos' });
        }
    } catch (error) {
        console.error("Error in updateBaseDatosSizes:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { controllerUploadExcel, getCostCenters, getOffices, getBaseDatos, deleteAllCostCenters, deleteAllOffices, deleteAllBaseDatos, updateBaseDatosSizes };
