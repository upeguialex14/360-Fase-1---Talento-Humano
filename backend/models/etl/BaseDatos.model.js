const db = require('../../config/db');

const getAll = async () => {
    try {
        const sql = `
            SELECT 
                p.document_number AS cedula, 
                CONCAT(p.first_name, ' ', p.last_name) AS apellidos_nombres,
                p.email AS correo_electronico,
                p.phone_number AS telefono,
                p.birthdate AS fecha_nacimiento,
                p.registration_date AS fecha_ingreso,
                pd.neighborhood AS barrio,
                pd.address AS direccion,
                pd.children_count AS nro_hijos,
                pei.name_emergency AS nombre_contacto_emergencia,
                pei.number_phone_emergency AS cel_emergencia,
                phs.bank_account AS cuenta_bancaria
            FROM people p
            LEFT JOIN people_details pd ON p.details_id = pd.details_id
            LEFT JOIN people_extended_info pei ON p.people_id = pei.people_id
            LEFT JOIN people_healt_security phs ON p.people_id = phs.people_id
            ORDER BY p.people_id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = { getAll };
