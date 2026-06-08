import { MAIN_TABS } from '../../utils/constants/index';

const app = getApp();

Page({
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    resultsLabel: '15 réservations',
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
});
