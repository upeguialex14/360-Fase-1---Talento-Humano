const pool = require('../config/db');

class Page {
    static async getPagesForRole(roleCode) {
        try {
            const [rows] = await pool.execute(
                'SELECT p.page_code, p.page_name, p.route, rp.can_view, rp.can_edit FROM pages p JOIN role_pages rp ON p.page_code = rp.page_code WHERE rp.role_code = ?',
                [roleCode]
            );
            return rows;
        } catch (err) {
            console.error('[Page] Error getting pages for role:', err);
            return [];
        }
    }

    static async getAllPages() {
        try {
            const [rows] = await pool.execute('SELECT * FROM pages');
            return rows;
        } catch (err) {
            console.error('[Page] Error getting all pages:', err);
            return [];
        }
    }

    static async getPageByCode(pageCode) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM pages WHERE page_code = ?',
                [pageCode]
            );
            return rows[0] || null;
        } catch (err) {
            console.error('[Page] Error getting page by code:', err);
            return null;
        }
    }

    static async getRolePages(roleCode) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    p.page_code, 
                    p.page_name, 
                    p.route, 
                    IFNULL(rp.can_view, 0) as can_view, 
                    IFNULL(rp.can_edit, 0) as can_edit 
                FROM pages p 
                LEFT JOIN role_pages rp ON p.page_code = rp.page_code AND rp.role_code = ?
                ORDER BY p.page_name ASC`,
                [roleCode]
            );
            return rows;
        } catch (err) {
            console.error('[Page] Error getting role pages:', err);
            throw err;
        }
    }

    static async updateRolePages(roleCode, pages, user) {
        const connection = await pool.getConnection();

        try {
            // Validate role exists
            const [roleCheck] = await connection.execute('SELECT 1 FROM roles WHERE role_code = ?', [roleCode]);
            if (roleCheck.length === 0) {
                throw new Error(`El rol '${roleCode}' no existe en la base de datos`);
            }

            // Validate pages exist
            if (pages.length > 0) {
                const pageCodes = pages.map(p => p.page_code);
                const [pageCheck] = await connection.query(
                    'SELECT page_code FROM pages WHERE page_code IN (?)',
                    [pageCodes]
                );

                if (pageCheck.length !== pages.length) {
                    const foundPages = pageCheck.map(p => p.page_code);
                    const missingPages = pageCodes.filter(code => !foundPages.includes(code));
                    throw new Error(`Las siguientes páginas no existen: ${missingPages.join(', ')}`);
                }
            }

            // Get old states for audit
            const [oldRows] = await connection.execute(
                'SELECT page_code, can_view, can_edit FROM role_pages WHERE role_code = ?',
                [roleCode]
            );
            const oldMap = {};
            oldRows.forEach(r => { oldMap[r.page_code] = r; });

            await connection.beginTransaction();

            // UPSERT
            const upsertQuery = `
                INSERT INTO role_pages (role_code, page_code, can_view, can_edit)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    can_view = VALUES(can_view),
                    can_edit = VALUES(can_edit),
                    updated_at = CURRENT_TIMESTAMP
            `;

            for (const p of pages) {
                await connection.execute(upsertQuery, [
                    roleCode,
                    p.page_code,
                    p.can_view ? 1 : 0,
                    p.can_edit ? 1 : 0
                ]);
            }

            // Audit
            for (const p of pages) {
                const prev = oldMap[p.page_code];
                const currentlyCanView = p.can_view ? 1 : 0;
                const previouslyCanView = prev ? prev.can_view : 0;

                if (!prev && currentlyCanView === 1) {
                    await connection.execute(
                        `INSERT INTO historial_permisos_roles (id, rol_id, nombre_rol, page, accion, realizado_por, nombre_admin, fecha_accion)
                         VALUES (?, NULL, ?, ?, 'otorgado', ?, ?, NOW())`,
                        [require('crypto').randomUUID(), roleCode, p.page_code, user.user_id, user.login]
                    );
                } else if (prev && currentlyCanView === 0 && previouslyCanView === 1) {
                    await connection.execute(
                        `INSERT INTO historial_permisos_roles (id, rol_id, nombre_rol, page, accion, realizado_por, nombre_admin, fecha_accion)
                         VALUES (?, NULL, ?, ?, 'revocado', ?, ?, NOW())`,
                        [require('crypto').randomUUID(), roleCode, p.page_code, user.user_id, user.login]
                    );
                }
            }

            await connection.commit();
            return { success: true, message: 'Permisos actualizados correctamente vía UPSERT' };

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[Page] Error updating role pages:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Page;