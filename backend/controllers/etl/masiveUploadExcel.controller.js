const uploadService = require('../../services/etl/masiveUploadExcel.service');

const controllerUploadExcel = async (req, res, next) => {
    try {
        // Validacion de que se haya enviado un archivo (portero)
        const file = req.file.buffer;
        if (!file) {
            return res.status(400).json({
                ok: false,
                msg: "No se envio ningun archivo"
            });
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
        console.log(error);
        //En caso de error devolvemos 500
        return res.status(500).json({
            ok: false,
            msg: error.message || "Error al subir el archivo"
        });
    }
}

module.exports = { controllerUploadExcel };
