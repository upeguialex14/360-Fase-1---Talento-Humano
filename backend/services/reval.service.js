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

// Token cache para la API de Correo (Puerto 8003)
let emailTokenCache = {
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
 * Crea un usuario en la API externa de REVAL (Puerto 8000)
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Respuesta de la API externa
 */
async function createRevalUser(userData) {
  try {
    console.log('🌐 REVAL SERVICE EJECUTADO (Puerto 8000)');
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

/**
 * Obtiene un token válido de la API de Correo externa en Puerto 8003 (con cache temporal)
 */
async function getRevalEmailToken() {
  const now = Date.now();
  if (emailTokenCache.token && emailTokenCache.expiresAt && now < emailTokenCache.expiresAt) {
    return emailTokenCache.token;
  }

  const emailUrl = process.env.REVAL_EMAIL_URL || 'http://10.70.41.102:8003';
  const emailUser = process.env.REVAL_EMAIL_USER || process.env.REVAL_USER || 'admin_reval';
  const emailPass = process.env.REVAL_EMAIL_PASS || process.env.REVAL_PASS || 'Seguridad2026!';

  try {
    console.log(`🔑 Obteniendo token de Correo en ${emailUrl}/token`);
    const response = await axios.post(`${emailUrl}/token`,
      new URLSearchParams({
        username: emailUser,
        password: emailPass,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token } = response.data;
    emailTokenCache.token = access_token;
    emailTokenCache.expiresAt = now + 10 * 60 * 1000;
    return access_token;
  } catch (error) {
    console.error('[REVAL_EMAIL][Token] Error al obtener token:', error.response?.data || error.message);
    throw new Error('No se pudo obtener token de la API de Correo (Puerto 8003)');
  }
}

/**
 * Crea un usuario en la API de Correo externa de REVAL en Puerto 8003 (Con creación de correo)
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Respuesta de la API externa
 */
async function createRevalEmailUser(userData) {
  try {
    console.log('🌐 REVAL EMAIL SERVICE EJECUTADO (Puerto 8003)');
    const token = await getRevalEmailToken();
    const emailUrl = process.env.REVAL_EMAIL_URL || 'http://10.70.41.102:8003';
    const response = await axios.post(
      `${emailUrl}/crear-usuario`,
      null,
      {
        params: userData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error('[REVAL_EMAIL][CreateUser] Error al crear usuario con correo:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

// Token cache para la API de osTicket (Puerto 8001)
let osticketTokenCache = {
  token: null,
  expiresAt: null,
};

/**
 * Obtiene un token válido de la API de osTicket (Puerto 8001)
 */
async function getOsticketToken() {
  const now = Date.now();
  if (osticketTokenCache.token && osticketTokenCache.expiresAt && now < osticketTokenCache.expiresAt) {
    return osticketTokenCache.token;
  }

  const osticketUrl = process.env.OSTICKET_URL || 'http://10.70.41.102:8001';
  const osticketUser = process.env.OSTICKET_USER || 'admin';
  const osticketPass = process.env.OSTICKET_PASS || 'admin123';

  try {
    console.log(`🔑 Obteniendo token de osTicket en ${osticketUrl}/token`);
    const response = await axios.post(`${osticketUrl}/token`,
      new URLSearchParams({
        username: osticketUser,
        password: osticketPass,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token } = response.data;
    osticketTokenCache.token = access_token;
    osticketTokenCache.expiresAt = now + 10 * 60 * 1000;
    return access_token;
  } catch (error) {
    console.error('[OSTICKET][Token] Error al obtener token:', error.response?.data || error.message);
    throw new Error('No se pudo obtener token de la API de osTicket (Puerto 8001)');
  }
}

/**
 * Crea un usuario en osTicket (Puerto 8001)
 * @param {Object} userData - { username, email, name }
 * @returns {Object} Respuesta incluyendo temporary_password
 */
async function createOsticketUser(userData) {
  try {
    console.log('🎫 OSTICKET SERVICE EJECUTADO (Puerto 8001)');
    const token = await getOsticketToken();
    const osticketUrl = process.env.OSTICKET_URL || 'http://10.70.41.102:8001';
    const response = await axios.post(
      `${osticketUrl}/users/create`,
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
    console.error('[OSTICKET][CreateUser] Error al crear usuario:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

module.exports = {
  getRevalToken,
  createRevalUser,
  getRevalEmailToken,
  createRevalEmailUser,
  getOsticketToken,
  createOsticketUser,
};
