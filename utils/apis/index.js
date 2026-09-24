// ============================================================================
// BACKEND API SERVICE
// Business logic layer for your application's API operations
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';

import {
  mapApiPackageToDestination,
  mapApiCategoryToFilter,
} from '../mappers/ats.js';

// ============================================================================
// API ENDPOINTS - Define your API paths here
// ============================================================================

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

// ============================================================================
// BACKEND API CLASS
// ============================================================================

/**
 * Service for your application's API operations.
 * All methods automatically handle authentication.
 *
 * @class BackendAPI
 */
class BackendAPI {
  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  async getPackages() {
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

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Resets the HTTP client session.
   * Call when starting a new user flow.
   */
  resetSession() {
    this.#client.resetSession();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/** @type {BackendAPI} */
export const backendAPI = new BackendAPI();

export { BackendAPI };
