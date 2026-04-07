/**
 * Configuración base de la API
 * Aquí defines la URL base de tu backend
 */

// URL base de tu API backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Función helper para hacer peticiones HTTP
 * @param {string} endpoint - Endpoint de la API (ej: '/empleados')
 * @param {object} options - Opciones de fetch (method, headers, body, etc.)
 * @returns {Promise} - Promesa con la respuesta
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Obtener token del localStorage si existe
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // Intentar parsear el JSON incluso si la respuesta no es OK (para obtener mensajes de error del backend)
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Si no es JSON, manejar según el status
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return null;
        }

        if (!response.ok) {
            // Devolver el objeto de error del backend si existe, de lo contrario lanzar error
            return {
                success: false,
                status: response.status,
                message: data.message || `Error del servidor (${response.status})`
            };
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        // Diferenciar error de red de error de API
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            return {
                success: false,
                message: 'Error de conexión con el servidor',
                isNetworkError: true
            };
        }
        throw error;
    }
};

/**
 * Métodos HTTP helper
 */
export const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;
