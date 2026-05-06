/**
 * Convierte una fecha serial de Excel (número) a formato YYYY-MM-DD
 * Excel cuenta días desde 1899-12-30.
 * 
 * @param {number|string} excelDate - El valor a convertir
 * @returns {string|null} - Fecha en formato YYYY-MM-DD o null si no es válida
 */
const excelDateToJS = (excelDate) => {
    if (excelDate === null || excelDate === undefined || excelDate === '') {
        return null;
    }

    // Si es un string, aplicar limpieza profunda (maneja casos como '27/05/1990 CUCUTA')
    if (typeof excelDate === 'string') {
        const str = excelDate.trim();
        if (str === '' || str === 'null') return null;

        // Buscar patrón DD/MM/YYYY o DD-MM-YYYY
        const matchDMY = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
        if (matchDMY) {
            const [_, day, month, year] = matchDMY;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Buscar patrón YYYY-MM-DD
        const matchYMD = str.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
        if (matchYMD) {
            const [_, year, month, day] = matchYMD;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Intento de Date nativo como último recurso
        const d = new Date(excelDate);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        return null;
    }

    // Si es un número (formato serial de Excel)
    const num = parseFloat(excelDate);
    if (!isNaN(num)) {
        // Un número de serie de Excel razonable está entre 1 (1900) y 100000 (2173)
        // Si el número es extremadamente grande (como un ID o teléfono), no es una fecha.
        if (num < 1 || num > 100000) {
            return null;
        }

        // Excel usa 1899-12-30 como base (25569 es el offset para Unix epoch)
        const date = new Date((num - 25569) * 86400 * 1000);

        // Verificar validez
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }

    return null;
};

module.exports = {
    excelDateToJS
};
