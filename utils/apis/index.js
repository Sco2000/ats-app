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

import {
  AppError,
  NetworkError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ExternalServiceError,
} from '../errors/index.js';

const ENDPOINTS = {
  CATEGORIES: '/categories',
  PACKAGES: '/packages',
  RECOMMENDED_PACKAGES: '/packages?recommended=true',
  BOOKINGS: '/bookings',
};

function createTypedError(res, fallbackMessage) {
  const status = res?.status || res?.error?.code || 0;
  const message = res?.error?.message || fallbackMessage;

  if (status === 401 || status === 403) {
    return new AuthorizationError(message, { status });
  }
  if (status === 400) {
    return new ValidationError(message, { status });
  }
  if (status === 404) {
    return new NotFoundError(message, { status });
  }
  if (status >= 500) {
    return new ExternalServiceError(message, { status });
  }
  if (status === 0) {
    return new NetworkError(message, { status });
  }
  return new AppError(message, { statusCode: status });
}

function getResponseBody(response, fallbackMessage) {
  if (!response || !response.success) {
    throw createTypedError(response, fallbackMessage);
  }

  return response.data || {};
}

function assertSuccessResponse(res, message) {
  const body = res && res.data ? res.data : null;

  if (!body || body.success !== true) {
    throw createTypedError(res, message);
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
      throw new ValidationError('Package id manquant');
    }

    await authenticate();

    const res = await this.#client.get(`${ENDPOINTS.PACKAGES}/${id}`);
    const body = getResponseBody(res, 'Impossible de recuperer le detail du package');
    const item = body.data && !Array.isArray(body.data)
      ? body.data
      : body;

    const destination = sculpt.data({ data: item, to: PackageSchema });

    if (!destination.id) {
      throw new NotFoundError('Detail du package incomplet');
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
    if (!reference) throw new ValidationError('Référence de réservation manquante');
    await authenticate();
    const res = await this.#client.get(`${ENDPOINTS.BOOKINGS}/${reference}`);
    const body = assertSuccessResponse(res, 'Impossible de récupérer la réservation');
    const targetData = body.data || body;
    return sculpt.data({ data: targetData, to: ReservationDetailSchema });
  }

  async getBookings(phone) {
    if (!phone) throw new ValidationError('Numéro de téléphone manquant');
    await authenticate();
    const res = await this.#client.get(ENDPOINTS.BOOKINGS, { query: { phone } });
    const body = getResponseBody(res, 'Impossible de récupérer les réservations');
    const items = Array.isArray(body) ? body : (Array.isArray(body.data) ? body.data : []);
    return sculpt.data({ data: items, to: ReservationDetailSchema });
  }

  async createBooking(payload) {
    await authenticate();
    const res = await this.#client.post(ENDPOINTS.BOOKINGS, payload);
    const body = assertSuccessResponse(res, 'Impossible de créer la réservation');
    const targetData = body.data || body;
    return sculpt.data({ data: targetData, to: ReservationSchema });
  }

  resetSession() {
    this.#client.resetSession();
  }
}

export const backendAPI = new BackendAPI();

export { BackendAPI };
