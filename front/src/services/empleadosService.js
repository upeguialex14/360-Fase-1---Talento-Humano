import api from './api';

/**
 * Servicio para gestionar empleados
 */
export const empleadosService = {
    /**
     * Obtener todos los empleados
     */
    getAll: async () => {
        return await api.get('/empleados');
    },

    /**
     * Obtener un empleado por ID
     * @param {number} id - ID del empleado
     */
    getById: async (id) => {
        return await api.get(`/empleados/${id}`);
    },

    /**
     * Crear un nuevo empleado
     * @param {object} empleadoData - Datos del empleado
     */
    create: async (empleadoData) => {
        return await api.post('/empleados', empleadoData);
    },

    /**
     * Actualizar un empleado
     * @param {number} id - ID del empleado
     * @param {object} empleadoData - Datos actualizados
     */
    update: async (id, empleadoData) => {
        return await api.put(`/empleados/${id}`, empleadoData);
    },

    /**
     * Eliminar un empleado
     * @param {number} id - ID del empleado
     */
    delete: async (id) => {
        return await api.delete(`/empleados/${id}`);
    },
};

export default empleadosService;
