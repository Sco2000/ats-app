import { MAIN_TABS } from '../../utils/constants/index';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { getLocalReservations } from '../../utils/helpers/reservations.js';

function truncateTitle(title, maxLength = 15) {
  const characters = Array.from(String(title || ''));
  return characters.length > maxLength
    ? `${characters.slice(0, maxLength - 1).join('')}…`
    : characters.join('');
}

Page({
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    loading: true,
    resultsLabel: '0 réservation',
  },

  onLoad() {
    this.refreshReservations();
  },

  onShow() {
    setCustomTabBarActive(this, 'voyages');
    this.refreshReservations();
  },

  refreshReservations() {
    this.setData({ loading: true });
    const reservations = getLocalReservations().map((item) => this.toCardModel(item));
    const total = reservations.length;

    this.setData({
      reservations,
      loading: false,
      resultsLabel: `${total} réservation${total > 1 ? 's' : ''}`,
    });
  },

  toCardModel(item) {
    const date = item.date ? new Date(`${item.date}T00:00:00`) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isUpcoming = Boolean(date && !Number.isNaN(date.getTime()) && date >= today);
    const status = isUpcoming ? 'upcoming' : 'done';
    return {
      ...item,
      id: item.bookingRef,
      image: item.package && item.package.image || '',
      title: item.package && item.package.title || '',
      cardTitle: truncateTitle(item.package && item.package.title),
      subtitle: item.package && item.package.location || '',
      dateLabel: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('fr-FR') : item.date || '',
      travelersLabel: `${item.travelers || 0} voyageur${item.travelers > 1 ? 's' : ''}`,
      price: `${Number(item.total || 0).toLocaleString('fr-FR')}${item.package && item.package.currency ? ` ${item.package.currency}` : ''}`,
      reference: item.bookingRef,
      status,
      statusLabel: isUpcoming ? 'À venir' : 'Terminé',
      showAction: isUpcoming,
      actionLabel: 'Gérer la réservation',
    };
  },

  openReservationDetails(event) {
    const bookingRef = event.detail.bookingRef;
    if (!bookingRef) return;
    wx.navigateTo({ url: `/pages/reservation-detail/reservation-detail?bookingRef=${encodeURIComponent(bookingRef)}` });
  },
});
