/**
 * Modelo de DOTACION (ETL)
 * Maneja la inserción de personal y sus tallas desde el proceso de carga masiva.
 * Ahora integrado con el modelo relacional de PEOPLE, PEOPLE_DETAILS y BUSINESS_PEOPLE_DATA.
 */
const pool = require('../../config/db');

const DotacionModel = {
    /**
     * Inserta o actualiza personal desde el Excel
     * Nota: Utiliza transacciones para asegurar consistencia en las 3 tablas
     */
    async bulkInsert(records) {
        if (records.length === 0) return { affectedRows: 0 };

        const connection = await pool.getConnection();
        let totalInserted = 0;

        try {
            await connection.beginTransaction();

            for (const row of records) {
                // 1. Manejar PEOPLE_DETAILS (Tallas)
                const [detailResult] = await connection.execute(`
                    INSERT INTO PEOPLE_DETAILS 
                        (size_shirt, size_jean, size_shoes, size_jacket, size_vest)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        size_shirt = VALUES(size_shirt),
                        size_jean = VALUES(size_jean),
                        size_shoes = VALUES(size_shoes),
                        size_jacket = VALUES(size_jacket),
                        size_vest = VALUES(size_vest)
                `, [row.t_camisa, row.t_pantalon, row.t_zapatos, row.t_chaqueta, row.t_chaleco || null]);
                
                const detailsId = detailResult.insertId || await this._getDetailsIdByCedula(connection, row.cedula);

                // 2. Manejar BUSINESS_PEOPLE_DATA
                const [businessResult] = await connection.execute(`
                    INSERT INTO BUSINESS_PEOPLE_DATA 
                        (start_date, unit_id, client_id, office_id, status_id)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        unit_id = VALUES(unit_id),
                        client_id = VALUES(client_id),
                        office_id = VALUES(office_id),
                        status_id = VALUES(status_id)
                `, [row.hire_date, row.unit_id, row.client_id, row.office_id, row.status_id || 1]);
                
                const businessId = businessResult.insertId || await this._getBusinessIdByCedula(connection, row.cedula);

                // 3. Manejar PEOPLE (Maestro)
                // Dividimos el nombre completo si es necesario
                const names = (row.full_name || '').split(' ');
                const firstName = names.slice(0, Math.ceil(names.length / 2)).join(' ');
                const lastName = names.slice(Math.ceil(names.length / 2)).join(' ');

                await connection.execute(`
                    INSERT INTO PEOPLE 
                        (document_number, first_name, last_name, people_business_id, details_id)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        first_name = VALUES(first_name),
                        last_name = VALUES(last_name),
                        people_business_id = VALUES(people_business_id),
                        details_id = VALUES(details_id)
                `, [row.cedula, firstName, lastName, businessId, detailsId]);

                totalInserted++;
            }

            await connection.commit();
            return { affectedRows: totalInserted };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Helpers internos para obtener IDs en caso de ON DUPLICATE KEY
    async _getDetailsIdByCedula(conn, cedula) {
        const [rows] = await conn.execute(
            'SELECT details_id FROM PEOPLE WHERE document_number = ?', [cedula]
        );
        return rows[0]?.details_id || null;
    },

    async _getBusinessIdByCedula(conn, cedula) {
        const [rows] = await conn.execute(
            'SELECT people_business_id FROM PEOPLE WHERE document_number = ?', [cedula]
        );
        return rows[0]?.people_business_id || null;
    }
};

module.exports = DotacionModel;