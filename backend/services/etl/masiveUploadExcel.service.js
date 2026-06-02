const xlsx = require('xlsx');
const costCenterProcessor = require('./processors/costCenterProcessor.service');
const hiringOrderProcessor = require('./processors/hiringOrderProcessor.service');
const baseDatosProcessor = require('./processors/baseDatosProcessor.service');
// Importamos el nuevo procesador que armamos
const dotacionProcessor = require('./processors/dotacion.processor.service');
const officeProcessor = require('./processors/officeProcessor.service');

const uploadExcel = async (data) => {
    const { fileBuffer, type, username } = data;

    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawJson = xlsx.utils.sheet_to_json(sheet);

    if (rawJson.length === 0) {
        throw new Error("El archivo Excel está vacío");
    }

    let result;
    switch (type) {
        case 'COST_CENTER':
            result = await costCenterProcessor.process(rawJson);
            break;
        case 'BASE_DATOS':
            result = await baseDatosProcessor.process(rawJson);
            break;
        case 'HIRING_ORDER':
            result = await hiringOrderProcessor.process(rawJson, username);
            break;
        // Nuevo caso para el inventario y dotación de las imágenes
        case 'DOTACION':
            result = await dotacionProcessor.process(rawJson);
            break;
        case 'OFFICES':
        case 'oficinas':
            result = await officeProcessor.process(rawJson);
            break;
        default:
            throw new Error("Tipo de carga no soportado: " + type);
    }

    return result;
};

module.exports = { uploadExcel };