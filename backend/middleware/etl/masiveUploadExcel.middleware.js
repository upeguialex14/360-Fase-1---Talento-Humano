/* No queremos guardar el archivo dentro del almacenamiento del equipo por ende
utilizaremos memoryStorage, para el archivo este disponible en el requerimiento req.file.buffer */
const multer = require('multer');

const storage = multer.memoryStorage();

// Validamos el archivo
const uploadConfig = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB

    },

    // validamos 2 tipos de archivos de excel, tanto los xlsx como los xls
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo invalido. Solo se permiten archivos exceles (.xlsx, .xls)'));
        }
    },
    // Valiamos nombres originales del archivo, pueden ocurrir cambios para intentar hackear o hacer caer el sistema
    filename: (req, file, cb) => {
        if (file.originalname.match(/\.(xlsx|xls)$/)) {
            cb(null, file.originalname);
        } else {
            cb(new Error('Formato de archivo invalido. Solo se permiten archivos exceles (.xlsx, .xls)'));
        }
    },

    // Validamos el tamaño del archivo, si no esta ocupando espacio lo rechazamos
    fileSize: (req, file, cb) => {
        if (file.size === 0) {
            cb(new Error('El archivo esta vacio'));
        }
    }

});

// Ejecutamos la validacion y mandamos el archivo al controlador
const uploadExcel = (req, res, next) => {
    // Aquí usamos la configuración 'uploadConfig' para procesar un solo archivo llamado 'file'
    const upload = uploadConfig.single('file');

    upload(req, res, (err) => {
        if (err) {
            // Si hay un error (pesa más de 10MB o no es Excel), respondemos aquí mismo
            return res.status(400).json({
                ok: false,
                msg: "Error en la carga del archivo",
                error: err.message
            });
        }
        // Si todo sale bien, 'next()' le da paso al Controlador
        next();
    });
};

module.exports = { uploadExcel };