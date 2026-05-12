// backend/services/reval.service.js
// Servicio para integración con API externa de REVAL

const axios = require('axios');
require('dotenv').config();

const REVAL_URL = process.env.REVAL_URL;
const REVAL_USER = process.env.REVAL_USER;
const REVAL_PASS = process.env.REVAL_PASS;

// Token cache para reutilizar si no ha expirado
let tokenCache = {
  token: null,
  expiresAt: null,
};

/**
 * Obtiene un token válido de la API externa (con cache temporal)
 */
async function getRevalToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt && now < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  try {
    const response = await axios.post(`${REVAL_URL}/token`,
      new URLSearchParams({
        username: REVAL_USER,
        password: REVAL_PASS,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token } = response.data;
    // Suponiendo que el token dura 10 minutos (ajustar si la API lo indica)
    tokenCache.token = access_token;
    tokenCache.expiresAt = now + 10 * 60 * 1000;
    return access_token;
  } catch (error) {
    console.error('[REVAL][Token] Error al obtener token:', error.response?.data || error.message);
    throw new Error('No se pudo obtener token de REVAL');
  }
}

/**
 * Crea un usuario en la API externa de REVAL
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Respuesta de la API externa
 */
async function createRevalUser(userData) {
  try {
    console.log('🌐 REVAL SERVICE EJECUTADO');
    const token = await getRevalToken();
    const response = await axios.post(
      `${REVAL_URL}/usuarios/crear`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error('[REVAL][CreateUser] Error al crear usuario:', error.response?.data || error.message);
    // Retornar error controlado
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

module.exports = {
  getRevalToken,
  createRevalUser,
};
