const Page = require('../models/page.model');
const Role = require('../models/role.model');

class RolePageService {
    async getRolePages(roleId) {
        // Validate role exists
        const role = await Role.getRoleById(roleId);
        if (!role) {
            throw new Error('El rol especificado no existe');
        }

        return await Page.getRolePages(roleId);
    }

    async updateRolePages(roleId, pages, user) {
        return await Page.updateRolePages(roleId, pages, user);
    }
}

module.exports = new RolePageService();