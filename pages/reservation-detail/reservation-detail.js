import { getReservationByReference } from '../../utils/helpers/reservations.js';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

function decodeBookingRef(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

function toDetailModel(reservation) {
  const date = reservation.date ? new Date(`${reservation.date}T00:00:00`) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = Boolean(date && !Number.isNaN(date.getTime()) && date >= today);
  const total = Number(reservation.total || 0).toLocaleString('fr-FR');
  const currency = reservation.package && reservation.package.currency;
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

Page({
  data: { bookingRef: '', reservation: null, loading: true, error: false, localFallback: false },

  onLoad(options = {}) {
    const bookingRef = decodeBookingRef(options.bookingRef);
    this.setData({ bookingRef });
    this.loadReservation();
  },

  async loadReservation() {
    const { bookingRef } = this.data;
    if (!bookingRef) {
      this.setData({ loading: false, error: true });
      return;
    }
    this.setData({ loading: true, error: false });
    try {
      const result = await getReservationByReference(bookingRef);
      this.setData({
        reservation: toDetailModel(result.reservation),
        localFallback: !result.fromApi,
        error: !result.fromApi,
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: true, localFallback: false });
    }
  },

  retry() { this.loadReservation(); },
  callSupport() { wx.showToast({ title: 'Appel du support', icon: 'none' }); },
  sendEmail() { wx.showToast({ title: 'Email au support', icon: 'none' }); },
  downloadTicket() { wx.showToast({ title: 'Billet téléchargé', icon: 'success' }); },
  cancelReservation() {},
  rebook() { wx.navigateTo({ url: '/pages/booking/booking' }); },
});
