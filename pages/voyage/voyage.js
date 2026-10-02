import { MAIN_TABS } from '../../utils/constants/index';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { getLocalReservationCards, getUserReservationCards } from '../../utils/helpers/reservations.js';
import { Bus } from '../../utils/event/index.js';
import { STATE_KEYS } from '../../utils/constants/index.js';

Page({
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    loading: true,
    resultsLabel: '',
  },

  onLoad() {
    this.refreshReservations();
  },

  onShow() {
    setCustomTabBarActive(this, 'voyages');
    this.refreshReservations();
  },

  async refreshReservations() {
    const local = getLocalReservationCards();
    if (local.length > 0) {
      this.setData({
        reservations: local,
        loading: false,
        resultsLabel: `${local.length} réservation${local.length > 1 ? 's' : ''}`,
      });
    } else {
      this.setData({ loading: true, resultsLabel: '' });
    }

    const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
    const phone = userData.msisdn || '770000000';

    try {
      const reservations = await getUserReservationCards(phone);
      const total = reservations.length;
      this.setData({
        reservations,
        loading: false,
        resultsLabel: total === 0 ? '' : `${total} réservation${total > 1 ? 's' : ''}`,
      });
    } catch (err) {
      console.warn('[Voyage] Erreur rafraîchissement réservations:', err);
      this.setData({ loading: false });
    }
  },

  openReservationDetails(event) {
    const detail = event.detail || {};
    const bookingRef = detail.bookingRef || detail.id || detail.reference;
    if (!bookingRef) return;
    wx.navigateTo({ url: `/pages/reservation-detail/reservation-detail?bookingRef=${encodeURIComponent(bookingRef)}` });
  },
});
