// ============================================================================
// AUTHENTICATION
// OAuth2 token management with caching and auto-refresh
// ============================================================================

import { httpClient } from './http.js';
import { config } from '../config.js';
import { STORAGE_KEYS, AUTH_CONFIG } from '../constants/index.js';

export function setAccessToken(token) {
  if (!token) {
    return null;
  }

  wx.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, token);
  httpClient.setToken(token);

  return token;
}

export function clearAccessToken() {
  wx.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN);
  wx.removeStorageSync(STORAGE_KEYS.TOKEN_EXPIRY);
  httpClient.setToken(null);
}

/**
 * Authentifie le client auprès de l'API ATS.
 * Utilise le token en cache s'il est valide, sinon en demande un nouveau.
 *
 * @returns {Promise<string>} Access token
 */
export async function authenticate() {
  const now = Date.now();
  const storedToken = wx.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN);
  const storedExp = wx.getStorageSync(STORAGE_KEYS.TOKEN_EXPIRY);

  // Retourne le token en cache s'il est encore valide
  if (storedToken && storedExp && now < storedExp) {
    httpClient.setToken(storedToken);
    return storedToken;
  }

  // Demande un nouveau jeton auprès de l'API ATS
  const body = {
    client_id: config.CLIENT_ID,
    client_secret: config.CLIENT_SECRET,
  };

  const res = await new Promise((resolve, reject) => {
    wx.request({
      method: 'POST',
      url: `${config.BASE_URL}${config.AUTH_URL}`,
      header: { 'Content-Type': 'application/json' },
      data: body,
      success: ({ data, statusCode }) => {
        if (statusCode >= 200 && statusCode < 300 && data) {
          resolve(data);
        } else {
          reject(new Error(`Auth failed with status ${statusCode}`));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || 'Network auth failure')),
    });
  });

  const accessToken = res.access_token || res.data?.access_token;
  const expiresIn = res.expires_in || res.data?.expires_in || AUTH_CONFIG.DEFAULT_EXPIRY_SEC;

  if (!accessToken) {
    throw new Error('Access token missing from auth response');
  }

  const expiry = now + (expiresIn * 1000) - AUTH_CONFIG.REFRESH_BUFFER_MS;

  // Mise en cache du jeton
  wx.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  wx.setStorageSync(STORAGE_KEYS.TOKEN_EXPIRY, expiry);
  httpClient.setToken(accessToken);

  return accessToken;
}
