import { backendAPI } from '../apis/index.js';
import { reservationStorage } from '../storage/reservations.js';

export function createReservation(payload, packageInfo) {
  return backendAPI.createBooking(payload).then((apiResult) => {
    if (!apiResult.bookingRef) throw new Error('La référence de réservation est absente de la réponse API');
    const reservation = {
      bookingRef: apiResult.bookingRef,
      package: {
        id: packageInfo.id,
        title: packageInfo.title,
        image: packageInfo.image || '',
        location: packageInfo.location || '',
        currency: packageInfo.currency,
      },
      date: payload.date,
      travelers: payload.travelers,
      total: payload.total,
      status: undefined,
      createdAt: new Date().toISOString(),
    };
    if (!reservationStorage.save(reservation)) throw new Error('Impossible de sauvegarder la réservation sur cet appareil');
    return reservation;
  });
}

export function getLocalReservations() {
  return reservationStorage.getAll();
}

export function getReservationByReference(reference) {
  const local = reservationStorage.getByReference(reference);
  return backendAPI.getBooking(reference).then((remote) => {
    const app = getApp();
    const packageInApp = ((app && app.globalData && app.globalData.DESTINATIONS) || [])
      .find((item) => String(item.id) === String(local && local.package && local.package.id));
    const merged = {
      ...(local || {}),
      bookingRef: remote.bookingRef || reference,
      package: {
        ...((packageInApp && {
          id: packageInApp.id,
          title: packageInApp.title,
          image: packageInApp.image,
          location: packageInApp.location || packageInApp.subtitle,
          currency: packageInApp.currency,
        }) || {}),
        ...((local && local.package) || {}),
        title: (local && local.package && local.package.title) || remote.packageTitle,
        currency: (local && local.package && local.package.currency) || remote.currency,
      },
      date: remote.date || (local && local.date),
      travelers: remote.travelers !== undefined ? remote.travelers : local && local.travelers,
      total: local ? local.total : remote.total,
      status: remote.status || (local && local.status),
      note: remote.note,
    };
    reservationStorage.update(merged);
    return { reservation: merged, fromApi: true };
  }).catch((error) => {
    if (!local) throw error;
    return { reservation: local, fromApi: false, error };
  });
}
