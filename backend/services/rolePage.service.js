const Page = require('../models/page.model');
const Role = require('../models/role.model');

class RolePageService {
    async getRolePages(roleCode) {
        // Validate role exists
        const role = await Role.getRoleByCode(roleCode);
        if (!role) {
            throw new Error('El rol especificado no existe');
        }

        return await Page.getRolePages(roleCode);
    }

    async updateRolePages(roleCode, pages, user) {
        return await Page.updateRolePages(roleCode, pages, user);
    }
}

module.exports = new RolePageService();