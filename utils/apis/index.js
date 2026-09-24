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
  RECOMMENDED_PACKAGES: '/packages?recommended=true',
  BOOKINGS: '/bookings',
};

function assertSuccessResponse(res, message) {
  const body = res && res.data ? res.data : null;

  if (!body || body.success !== true) {
    throw new Error(message);
  }

  return body;
}

class BackendAPI {
  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  async getPackages(params = {}) {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.PACKAGES, { query: params });
    const body = assertSuccessResponse(res, 'Failed to fetch packages');
    const items = Array.isArray(body.data) ? body.data : [];

    return items.map(mapApiPackageToDestination);
  }

  async getRecommendedPackages() {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.RECOMMENDED_PACKAGES);
    const body = assertSuccessResponse(res, 'Failed to fetch recommended packages');
    const items = Array.isArray(body.data) ? body.data : [];

    return items.map(mapApiPackageToDestination);
  }

  async getCategories() {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.CATEGORIES);
    const body = assertSuccessResponse(res, 'Failed to fetch categories');
    const items = Array.isArray(body.data) ? body.data : [];

    return [
      { id: 'all', label: 'Tous' },
      ...items.map(mapApiCategoryToFilter),
    ];
  }

  async createBooking(payload) {
    await authenticate();

    const res = await this.#client.post(ENDPOINTS.BOOKINGS, payload);
    return assertSuccessResponse(res, 'Failed to create booking');
  }

  resetSession() {
    this.#client.resetSession();
  }
}

export const backendAPI = new BackendAPI();

export { BackendAPI };
