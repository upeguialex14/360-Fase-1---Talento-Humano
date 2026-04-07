import { useState, useEffect } from 'react';

/**
 * Custom hook para hacer peticiones a la API
 * @param {Function} apiFunction - Función del servicio API a ejecutar
 * @param {boolean} immediate - Si debe ejecutarse inmediatamente
 * @returns {object} - Estado de la petición (data, loading, error, refetch)
 */
export const useFetch = (apiFunction, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiFunction();
            setData(result);
        } catch (err) {
            setError(err.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, []);

    return { data, loading, error, refetch: fetchData };
};

export default useFetch;
