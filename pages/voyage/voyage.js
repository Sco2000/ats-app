import { MAIN_TABS } from '../../utils/constants/index';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

const app = getApp();

Page({
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    resultsLabel: '15 réservations',
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
    const reservations = Array.isArray(app.globalData.RESERVATIONS)
      ? app.globalData.RESERVATIONS
      : [];

    const total = Number(app.globalData.RESERVATIONS_TOTAL || reservations.length || 0);

    this.setData({
      reservations,
      resultsLabel: `${total} réservation${total > 1 ? 's' : ''}`,
    });
  },

  openReservationDetails(event) {
    const { id } = event.currentTarget.dataset;
    const reservation = this.data.reservations.find((item) => Number(item.id) === Number(id));

    if (!reservation) {
      return;
    }

    this.setData({
      selectedReservation: reservation,
      selectedReservationIsUpcoming: reservation.detailActions !== 'rebook' && reservation.status !== 'done',
      showReservationPopup: true,
    });
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
