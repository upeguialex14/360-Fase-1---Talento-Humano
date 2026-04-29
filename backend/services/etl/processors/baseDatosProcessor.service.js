const db = require('../../../config/db');

const process = async (jsonData) => {
    let processed = 0;
    let inserted = 0;
    
    // Normalize headers
    const normalizedData = jsonData.map(row => {
        const normalizedRow = {};
        for (const [key, value] of Object.entries(row)) {
            const normalizedKey = key.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                .replace(/\s+/g, '_') // spaces to underscores
                .replace(/[^a-z0-9_]/g, ''); // remove non-alphanumeric except underscores
            normalizedRow[normalizedKey] = value;
        }
        return { original: row, normalized: normalizedRow };
    });

    for (const item of normalizedData) {
        processed++;
        const row = item.normalized;
        const original = item.original;

        // Try to find the exact column names from the raw data if the normalized one fails,
        // or map based on expected columns.
        const cedula = row.cedula || original['CEDULA'];
        if (!cedula) continue; // Skip if no cedula

        // Mapeo básico a tabla people (Campos directos)
        const peopleFields = {
            document_number: cedula,
            first_name: row.apellidos_y_nombres ? row.apellidos_y_nombres.split(' ')[0] : null,
            last_name: row.apellidos_y_nombres ? row.apellidos_y_nombres.split(' ').slice(1).join(' ') : null,
            email: row.correo_electronico || original['CORREO ELECTRONICO'] || null,
            phone_number: row.telefono || original['TELEFONO'] || null,
            birthdate: row.fecha_nacimiento || original['FECHA NACIMIENTO'] || null,
            registration_date: row.fecha_de_ingreso || original['FECHA DE INGRESO'] || null,
        };

        // Filtramos nulos
        Object.keys(peopleFields).forEach(key => {
            if (peopleFields[key] === null) delete peopleFields[key];
        });

        const keys = Object.keys(peopleFields);
        const values = Object.values(peopleFields);
        
        if (keys.length === 0) continue;

        // UPSERT statement for people
        const sql = `
            INSERT INTO people (${keys.join(', ')})
            VALUES (${keys.map(() => '?').join(', ')})
            ON DUPLICATE KEY UPDATE
            ${keys.map(k => `${k} = VALUES(${k})`).join(', ')}
        `;

        try {
            await db.query(sql, values);
            inserted++;
            
            // Aquí irían las inserciones a people_details, people_extended_info, y people_healt_security
            // Requiere lógica adicional para mapear textos (ej. "MASCULINO") a IDs (ej. gender_id = 1)
        } catch (err) {
            console.error('Error insertando en people:', err);
        }
    }

    return { success: true, processed, inserted };
};

module.exports = { process };
