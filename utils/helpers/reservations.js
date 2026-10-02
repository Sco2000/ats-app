import { backendAPI } from '../apis/index.js';
import { reservationStorage } from '../storage/reservations.js';
import { Bus } from '../event/index.js';
import { STATE_KEYS } from '../constants/index.js';
import { AppError, ExternalServiceError } from '../errors/index.js';

export function createReservation(payload, packageInfo = {}) {
  const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
  const phone = payload.phone || userData.msisdn || '770000000';
  const bookingPayload = {
    ...payload,
    phone,
  };

  return backendAPI.createBooking(bookingPayload).then((apiResult) => {
    if (!apiResult.bookingRef) throw new ExternalServiceError('La référence de réservation est absente de la réponse API');
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
    if (!reservationStorage.save(reservation)) throw new AppError('Impossible de sauvegarder la réservation sur cet appareil');
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
  return getLocalReservations().map((item, index) => {
    const upcoming = isUpcomingReservation(item);
    const title = item.package && item.package.title || '';
    const currency = item.package && item.package.currency;
    const characters = Array.from(String(title));
    const cardTitle = characters.length > 15 ? `${characters.slice(0, 14).join('')}…` : title;
    const ref = item.bookingRef || item.id || item.reference || `local_res_${index}_${Date.now()}`;
    return {
      ...item,
      id: ref,
      bookingRef: ref,
      reference: ref,
      image: item.package && item.package.image || '',
      title,
      cardTitle,
      subtitle: item.package && item.package.location || '',
      dateLabel: formatDate(item.date),
      travelersLabel: `${item.travelers || 0} voyageur${item.travelers > 1 ? 's' : ''}`,
      price: `${Number(item.total || 0).toLocaleString('fr-FR')}${currency ? ` ${currency}` : ''}`,
      status: upcoming ? 'upcoming' : 'done',
      statusLabel: upcoming ? 'À venir' : 'Terminé',
      showAction: upcoming,
      actionLabel: 'Gérer la réservation',
    };
  });
}

export function mapRemoteReservationToCard(item, index = 0) {
  const upcoming = isUpcomingReservation(item);
  const title = item.packageTitle || (item.package && (typeof item.package === 'string' ? item.package : item.package.title)) || item.title || '';
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

  const ref = item.booking_ref || item.bookingRef || item.reference || item.id || `remote_res_${index}_${Date.now()}`;
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
  const currency = (reservation.package && reservation.package.currency) || reservation.currency || 'XOF';
  const total = Number(reservation.total || 0).toLocaleString('fr-FR');

  const adultes = Number(reservation.travelersAdulte || 0);
  const enfants = Number(reservation.travelersEnfant || 0);
  const totalTravelers = reservation.travelers || (adultes + enfants) || 0;
  let travelersLabel;
  if (adultes > 0 || enfants > 0) {
    const parts = [];
    if (adultes > 0) parts.push(`${adultes} adulte${adultes > 1 ? 's' : ''}`);
    if (enfants > 0) parts.push(`${enfants} enfant${enfants > 1 ? 's' : ''}`);
    travelersLabel = parts.join(' + ');
  } else {
    travelersLabel = `${totalTravelers} voyageur${totalTravelers > 1 ? 's' : ''}`;
  }

  const statusLabels = {
    pending_payment: 'En attente de paiement',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancellation_requested: 'Annulation demandée',
    cancelled: 'Annulé',
    on_hold: 'En attente',
    refunded: 'Remboursé',
    failed: 'Échoué',
  };
  const statusLabel = statusLabels[reservation.status] || (upcoming ? 'À venir' : 'Terminé');
  const statusClass = (() => {
    if (['confirmed'].includes(reservation.status)) return 'upcoming';
    if (['completed'].includes(reservation.status)) return 'done';
    if (['cancelled', 'failed', 'refunded'].includes(reservation.status)) return 'cancelled';
    if (['cancellation_requested', 'pending_payment', 'on_hold'].includes(reservation.status)) return 'pending';
    return upcoming ? 'upcoming' : 'done';
  })();

  return {
    ...reservation,
    package: reservation.package || {},
    dateLabel: formatDate(reservation.date),
    travelersLabel,
    totalLabel: `${total} ${currency}`,
    statusLabel,
    statusClass,
    isUpcoming: upcoming && !['cancelled', 'cancellation_requested', 'failed'].includes(reservation.status),
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
      travelersAdulte: remote.travelersAdulte !== undefined ? remote.travelersAdulte : (local && local.travelersAdulte),
      travelersEnfant: remote.travelersEnfant !== undefined ? remote.travelersEnfant : (local && local.travelersEnfant),
      total: local ? local.total : remote.total,
      currency: remote.currency || (local && local.currency) || 'XOF',
      status: remote.status || (local && local.status),
      transactionId: remote.transactionId || '',
      note: remote.note,
    };
    reservationStorage.update(merged);
    return { reservation: merged, fromApi: true };
  }).catch((error) => {
    if (!local) throw error;
    return { reservation: local, fromApi: false, error };
  });
}
