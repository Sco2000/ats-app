import { MAIN_TABS } from '../../utils/constants/index';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { getLocalReservations, getReservationByReference } from '../../utils/helpers/reservations.js';

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
    resultsLabel: '0 réservation',
    showReservationPopup: false,
    selectedReservation: null,
    selectedReservationIsUpcoming: true,
  },

  onLoad() {
    this.refreshReservations();
  },

  onShow() {
    setCustomTabBarActive(this, 'voyages');
    this.refreshReservations();
  },

  refreshReservations() {
    const reservations = getLocalReservations().map((item) => this.toCardModel(item));
    const total = reservations.length;

    this.setData({
      reservations,
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
    const { id } = event.currentTarget.dataset;
    const reservation = this.data.reservations.find((item) => item.id === id);

    if (!reservation) {
      return;
    }

    this.setData({
      selectedReservation: reservation,
      selectedReservationIsUpcoming: reservation.status === 'upcoming',
      showReservationPopup: true,
    });
    this.loadReservationDetails(reservation.reference);
  },

  async loadReservationDetails(reference) {
    this.setData({ detailLoading: true, detailError: false });
    try {
      const result = await getReservationByReference(reference);
      if (this.data.selectedReservation && this.data.selectedReservation.reference === reference) {
        this.setData({ selectedReservation: this.toCardModel(result.reservation), detailError: !result.fromApi });
      }
      if (!result.fromApi) wx.showToast({ title: 'Détail indisponible. Données locales affichées.', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: 'Impossible de charger le détail. Réessayez.', icon: 'none' });
      this.setData({ detailError: true });
    } finally {
      this.setData({ detailLoading: false });
    }
  },

  retryReservationDetails() {
    const item = this.data.selectedReservation;
    if (item && item.reference) this.loadReservationDetails(item.reference);
  },

  closeReservationPopup() {
    this.setData({
      showReservationPopup: false,
      selectedReservation: null,
    });
  },

  callSupport() {
    wx.showToast({
      title: 'Appel du support',
      icon: 'none',
    });
  },

  sendEmail() {
    wx.showToast({
      title: 'Email au support',
      icon: 'none',
    });
  },

  downloadTicket() {
    wx.showToast({
      title: 'Billet téléchargé',
      icon: 'success',
    });
  },

  cancelReservation() {},

  rebook() {
    wx.navigateTo({
      url: '/pages/booking/booking',
    });
  },
});
