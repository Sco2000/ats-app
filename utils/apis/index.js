// ============================================================================
// ATS BACKEND API SERVICE
// Centralized access to ATS REST endpoints.
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';
import {
  mapApiCategoryToFilter,
  mapApiPackageToDestination,
} from '../mappers/ats.js';

const ENDPOINTS = {
  CATEGORIES: '/categories',
  PACKAGES: '/packages',
};

function getResponseBody(response, fallbackMessage) {
  if (!response || !response.success) {
    throw new Error(response?.error?.message || fallbackMessage);
  }

  return response.data || {};
}

function assertSuccessResponse(res, message) {
  const body = res && res.data ? res.data : null;

  if (!body || body.success !== true) {
    throw new Error(message);
  }

  return body;
}

/**
 * Service for your application's API operations.
 * All methods automatically handle authentication.
 *
 * @class BackendAPI
 */
class BackendAPI {
  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  async getPackages(params = {}) {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.PACKAGES);
    const body = getResponseBody(res, 'Impossible de recuperer les packages');
    const items = Array.isArray(body.data) ? body.data : [];

    return items.map(mapApiPackageToDestination);
  }

  async getPackage(id) {
    if (!id) {
      throw new Error('Package id manquant');
    }

    await authenticate();

    const res = await this.#client.get(`${ENDPOINTS.PACKAGES}/${id}`);
    const body = getResponseBody(res, 'Impossible de recuperer le detail du package');
    const item = body.data && !Array.isArray(body.data)
      ? body.data
      : body;

    const destination = mapApiPackageToDestination(item);

    if (!destination.id) {
      throw new Error('Detail du package incomplet');
    }

    return destination;
  }

  async getCategories() {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.CATEGORIES);
    const body = getResponseBody(res, 'Impossible de recuperer les categories');
    const items = Array.isArray(body.data) ? body.data : [];

    return [
      { id: 'all', label: 'Tous' },
      ...items.map(mapApiCategoryToFilter),
    ];
  }

  async getBooking(reference) {
    await authenticate();
    const res = await this.#client.get(`${ENDPOINTS.BOOKINGS}/${reference}`);
    return assertSuccessResponse(res, 'Failed to fetch booking');
  }

  resetSession() {
    this.#client.resetSession();
  }
}

export const backendAPI = new BackendAPI();

export { BackendAPI };
