// ============================================================================
// AUTHENTICATION BRIDGE
// MaxIt owns authentication. This module only stores a token when one is
// provided by the host/native layer and attaches it to the HTTP client.
// ============================================================================

import { httpClient } from './http.js';
import { config } from '../config.js';
import { __DEV__, STORAGE_KEYS } from '../constants/index.js';

let authPromise = null;

export function setAccessToken(token, expiresInSeconds) {
  const normalizedToken = typeof token === 'string' ? token.trim() : '';

  if (!normalizedToken) {
    return null;
  }

  wx.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, normalizedToken);
  if (Number.isFinite(expiresInSeconds) && expiresInSeconds > 0) {
    wx.setStorageSync(STORAGE_KEYS.TOKEN_EXPIRY, Date.now() + (expiresInSeconds * 1000));
  }
  httpClient.setToken(normalizedToken);

  return normalizedToken;
}

export function clearAccessToken() {
  wx.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN);
  wx.removeStorageSync(STORAGE_KEYS.TOKEN_EXPIRY);
  httpClient.setToken(null);
}

export async function authenticate() {
  if (authPromise) return authPromise;

  authPromise = Promise.resolve().then(() => {
    const storedToken = wx.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN);
    const expiry = Number(wx.getStorageSync(STORAGE_KEYS.TOKEN_EXPIRY) || 0);

    if (expiry && expiry <= Date.now()) {
      clearAccessToken();
      return null;
    }

    if (storedToken) return setAccessToken(storedToken);

    // This is intentionally restricted to local development. Production tokens
    // must be supplied by the trusted native host or backend.
    if (__DEV__ && config.DEV_ACCESS_TOKEN) {
      return setAccessToken(config.DEV_ACCESS_TOKEN);
    }

    return null;
  }).finally(() => {
    authPromise = null;
  });

  return authPromise;
}
