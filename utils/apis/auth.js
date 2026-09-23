// ============================================================================
// AUTHENTICATION BRIDGE
// MaxIt owns authentication. This module only stores a token when one is
// provided by the host/native layer and attaches it to the HTTP client.
// ============================================================================

import { httpClient } from './http.js';
import { STORAGE_KEYS } from '../constants/index.js';

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

export async function authenticate() {
  const storedToken = wx.getStorageSync(STORAGE_KEYS.ACCESS_TOKEN);

  if (storedToken) {
    httpClient.setToken(storedToken);
    return storedToken;
  }

  return null;
}
