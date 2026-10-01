import { backendAPI } from '../apis/index.js';
import { reservationStorage } from '../storage/reservations.js';
import { Bus } from '../event/index.js';
import { STATE_KEYS } from '../constants/index.js';

export function createReservation(payload, packageInfo = {}) {
  const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
  const phone = payload.phone || userData.msisdn || '770000000';
  const bookingPayload = {
    ...payload,
    phone,
  };

  return backendAPI.createBooking(bookingPayload).then((apiResult) => {
    if (!apiResult.bookingRef) throw new Error('La référence de réservation est absente de la réponse API');
    const reservation = {
      bookingRef: apiResult.bookingRef,
      package: {
        id: packageInfo?.id || '',
        title: packageInfo?.title || '',
        image: packageInfo?.image || '',
        location: packageInfo?.location || '',
        currency: packageInfo?.currency || apiResult.currency || 'XOF',
      },
      date: payload.date,
      travelers: payload.travelers,
      total: apiResult.total,
      currency: apiResult.currency,
      status: apiResult.status,
      createdAt: new Date().toISOString(),
    };
    if (!reservationStorage.save(reservation)) throw new Error('Impossible de sauvegarder la réservation sur cet appareil');
    return reservation;
  });
}

export function getLocalReservations() {
  return reservationStorage.getAll();
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

function isUpcomingReservation(reservation) {
  const date = reservation.date ? new Date(`${reservation.date}T00:00:00`) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Boolean(date && !Number.isNaN(date.getTime()) && date >= today);
}

export function getLocalReservationCards() {
  return getLocalReservations().map((item) => {
    const upcoming = isUpcomingReservation(item);
    const title = item.package && item.package.title || '';
    const currency = item.package && item.package.currency;
    const characters = Array.from(String(title));
    const cardTitle = characters.length > 15 ? `${characters.slice(0, 14).join('')}…` : title;
    return {
      ...item,
      id: item.bookingRef,
      image: item.package && item.package.image || '',
      title,
      cardTitle,
      subtitle: item.package && item.package.location || '',
      dateLabel: formatDate(item.date),
      travelersLabel: `${item.travelers || 0} voyageur${item.travelers > 1 ? 's' : ''}`,
      price: `${Number(item.total || 0).toLocaleString('fr-FR')}${currency ? ` ${currency}` : ''}`,
      reference: item.bookingRef,
      status: upcoming ? 'upcoming' : 'done',
      statusLabel: upcoming ? 'À venir' : 'Terminé',
      showAction: upcoming,
      actionLabel: 'Gérer la réservation',
    };
  });
}

export function mapRemoteReservationToCard(item) {
  const upcoming = isUpcomingReservation(item);
  const title = (item.package && (typeof item.package === 'string' ? item.package : item.package.title)) || item.title || '';
  const currency = item.currency || 'XOF';
  const characters = Array.from(String(title));
  const cardTitle = characters.length > 15 ? `${characters.slice(0, 14).join('')}…` : title;

  const statusLabels = {
    pending_payment: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancellation_requested: 'Annulation demandée',
    cancelled: 'Annulé',
  };
  const statusLabel = statusLabels[item.status] || (upcoming ? 'À venir' : 'Terminé');

  const ref = item.booking_ref || item.bookingRef || '';
  const image = item.image || (item.package && item.package.image) || '';
  const subtitle = item.location || (item.package && item.package.location) || '';

  return {
    ...item,
    id: ref,
    bookingRef: ref,
    reference: ref,
    image,
    title,
    cardTitle,
    subtitle,
    dateLabel: formatDate(item.date),
    travelersLabel: `${item.travelers || 0} voyageur${item.travelers > 1 ? 's' : ''}`,
    price: `${Number(item.total || 0).toLocaleString('fr-FR')} ${currency}`,
    status: item.status || (upcoming ? 'upcoming' : 'done'),
    statusLabel,
    showAction: true,
    actionLabel: 'Gérer la réservation',
  };
}

export async function getUserReservationCards(phone) {
  const localCards = getLocalReservationCards();
  if (!phone) return localCards;

  try {
    const remoteList = await backendAPI.getBookings(phone);
    if (Array.isArray(remoteList) && remoteList.length > 0) {
      const remoteCards = remoteList.map(mapRemoteReservationToCard);
      const mergedMap = new Map();
      remoteCards.forEach((c) => mergedMap.set(c.bookingRef, c));
      localCards.forEach((c) => {
        if (!mergedMap.has(c.bookingRef)) {
          mergedMap.set(c.bookingRef, c);
        }
      });
      return Array.from(mergedMap.values());
    }
  } catch (error) {
    console.warn('[Reservations] Failed to fetch remote bookings:', error);
  }
  return localCards;
}

export function buildReservationDetail(reservation) {
  const upcoming = isUpcomingReservation(reservation);
  const currency = reservation.package && reservation.package.currency;
  const total = Number(reservation.total || 0).toLocaleString('fr-FR');
  return {
    ...reservation,
    package: reservation.package || {},
    dateLabel: formatDate(reservation.date),
    travelersLabel: `${reservation.travelers || 0} voyageur${reservation.travelers > 1 ? 's' : ''}`,
    totalLabel: `${total}${currency ? ` ${currency}` : ''}`,
    statusLabel: upcoming ? 'À venir' : 'Terminé',
    statusClass: upcoming ? 'upcoming' : 'done',
    isUpcoming: upcoming,
  };
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
        id: (local && local.package && local.package.id) || (packageInApp && packageInApp.id) || '',
        title: (local && local.package && local.package.title) || (packageInApp && packageInApp.title) || remote.packageTitle || '',
        image: (local && local.package && local.package.image) || (packageInApp && packageInApp.image) || remote.image || '',
        location: (local && local.package && local.package.location) || (packageInApp && (packageInApp.location || packageInApp.subtitle)) || remote.location || '',
        currency: (local && local.package && local.package.currency) || (packageInApp && packageInApp.currency) || remote.currency || 'XOF',
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
