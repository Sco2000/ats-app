// ============================================================================
// ATS BACKEND API SERVICE
// Centralized access to ATS REST endpoints.
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';
import { sculpt } from '../json-sculpt/sculpt.js';
import { CategorySchema } from '../mappers/category.sculpt.js';
import { PackageSchema } from '../mappers/package.sculpt.js';
import { ReservationDetailSchema, ReservationSchema } from '../mappers/reservation.sculpt.js';

const ENDPOINTS = {
  CATEGORIES: '/categories',
  PACKAGES: '/packages',
  RECOMMENDED_PACKAGES: '/packages?recommended=true',
  BOOKINGS: '/bookings',
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

    return sculpt.data({ data: items, to: PackageSchema });
  }

  async getRecommendedPackages() {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.RECOMMENDED_PACKAGES);
    const body = getResponseBody(res, 'Impossible de récupérer les packages recommandés');
    const items = Array.isArray(body) ? body : (Array.isArray(body.data) ? body.data : []);

    return sculpt.data({ data: items, to: PackageSchema });
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

    const destination = sculpt.data({ data: item, to: PackageSchema });

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
      ...sculpt.data({ data: items, to: CategorySchema }),
    ];
  }

  async getBooking(reference) {
    if (!reference) throw new Error('Référence de réservation manquante');
    await authenticate();
    const res = await this.#client.get(`${ENDPOINTS.BOOKINGS}/${reference}`);
    const body = assertSuccessResponse(res, 'Impossible de récupérer la réservation');
    return sculpt.data({ data: body.data, to: ReservationDetailSchema });
  }

  async getBookings(phone) {
    if (!phone) throw new Error('Numéro de téléphone manquant');
    await authenticate();
    const res = await this.#client.get(ENDPOINTS.BOOKINGS, { query: { phone } });
    const body = getResponseBody(res, 'Impossible de récupérer les réservations');
    const items = Array.isArray(body) ? body : (Array.isArray(body.data) ? body.data : []);
    return items;
  }

  async createBooking(payload) {
    await authenticate();
    const res = await this.#client.post(ENDPOINTS.BOOKINGS, payload);
    const body = assertSuccessResponse(res, 'Impossible de créer la réservation');
    return sculpt.data({ data: body, to: ReservationSchema });
  }

  resetSession() {
    this.#client.resetSession();
  }
}

export const backendAPI = new BackendAPI();

export { BackendAPI };
