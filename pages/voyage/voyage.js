import { MAIN_TABS } from '../../utils/constants/index';

const app = getApp();

Page({
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    resultsLabel: '15 réservations',
    showReservationPopup: false,
    selectedReservationId: ''
  },

  onLoad() {
    this.refreshReservations();
  },

  onShow() {
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
    if (!id) {
      return;
    }

    this.setData({
      showReservationPopup: true,
      selectedReservationId: id
    });
  },

  handlePopupClose() {
    this.setData({
      showReservationPopup: false,
      selectedReservationId: ''
    });
  },

  handleBookAgain(event) {
    const { reservation } = event.detail;
    console.log('Book again:', reservation);
    this.handlePopupClose();
  },

  handleDownloadTicket(event) {
    const { reservation } = event.detail;
    console.log('Download ticket:', reservation);
  },

  handleCancelReservation(event) {
    const { reservation } = event.detail;
    console.log('Cancel reservation:', reservation);
    this.handlePopupClose();
  }
});