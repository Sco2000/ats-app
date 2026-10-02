import { storage } from '../storage.js';

const KEY = 'ats_local_reservations';

export const reservationStorage = {
  getAll() {
    const entries = storage.get(KEY, []);
    return Array.isArray(entries) ? entries : [];
  },
  getByReference(bookingRef) {
    if (!bookingRef) return null;
    return this.getAll().find((item) => (
      item.bookingRef === bookingRef ||
      item.id === bookingRef ||
      item.reference === bookingRef
    )) || null;
  },
  save(reservation) {
    const entries = this.getAll();
    const ref = reservation.bookingRef || reservation.id || reservation.reference || `res_${Date.now()}`;
    const normalized = {
      ...reservation,
      bookingRef: ref,
      id: ref,
      reference: ref,
    };
    const existingIndex = entries.findIndex((item) => (
      item.bookingRef === ref ||
      item.id === ref ||
      item.reference === ref
    ));
    if (existingIndex >= 0) entries[existingIndex] = normalized;
    else entries.unshift(normalized);
    return storage.set(KEY, entries);
  },
  update(reservation) {
    const entries = this.getAll();
    const ref = reservation.bookingRef || reservation.id || reservation.reference;
    if (!ref) return false;
    const index = entries.findIndex((item) => (
      item.bookingRef === ref ||
      item.id === ref ||
      item.reference === ref
    ));
    if (index < 0) return false;
    entries[index] = {
      ...entries[index],
      ...reservation,
      bookingRef: ref,
      id: ref,
      reference: ref,
    };
    return storage.set(KEY, entries);
  },
};
