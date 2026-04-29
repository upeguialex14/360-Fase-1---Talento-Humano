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

    // Si ya es un formato de fecha tipo string (ej: '2025-01-01' o '01/01/2025')
    if (typeof excelDate === 'string' && isNaN(excelDate)) {
        // Intentar ver si es una fecha válida por JS
        const d = new Date(excelDate);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        return excelDate; // Devolver tal cual si no se puede parsear pero no es número
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
