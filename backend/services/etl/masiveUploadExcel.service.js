//Importamos la libreria xlsx con sus funcionesS
const xlsx = require('xlsx');
const costCenterProcesor = require('./processors/costCenterProcessor.service');


const uploadExcel = async (data) => {
    //Destructuramos los datos que vienen
    const { fileBuffer, type } = data;

    //Convertimos el buffer en JSON
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawJson = xlsx.utils.sheet_to_json(sheet);


    if (rawJson.length === 0) {
        throw new Error("El archivo Excel está vacío");
    }


    // Transformamos y cargamos segun el tipo en el procesador correspontiende
    let result;
    switch (type) {
        case 'COST_CENTER':
            result = await costCenterProcessor.process(rawJson);
            break;
        case 'HIRING_ORDER':
            // result = await hiringOrderProcessor.process(rawJson);
            break;
        /*case 'PEOPLE':
            // result = await orderProcessor.process(rawJson);
            break; ARMAR LOGICA DESPUES YA QUE ESTA PEOPLE, PEOPLE_DETAILS Y PEOPLE_BUSSINES*/
        default:
            throw new Error("Tipo de carga no soportado");
    }
}