import { MAIN_TABS } from '../../utils/constants/index';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { getLocalReservationCards, getUserReservationCards } from '../../utils/helpers/reservations.js';
import { Bus } from '../../utils/event/index.js';
import { STATE_KEYS } from '../../utils/constants/index.js';
import { handleAppError } from '../../utils/helpers/error-handler.js';
import { i18n } from '../../utils/locales/fr/index.js';

const app = getApp();

Page({
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    loading: true,
    error: false,
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
    // Afficher les données locales immédiatement (évite un écran vide)
    const local = getLocalReservationCards();
    if (local.length > 0) {
      this.setData({
        reservations: local,
        loading: false,
        error: false,
        resultsLabel: `${local.length} réservation${local.length > 1 ? 's' : ''}`,
      });
    } else {
      this.setData({ loading: true, error: false, resultsLabel: '' });
    }

    // Attendre que l'app soit initialisée pour avoir le vrai msisdn
    if (app.globalData.initPromise) await app.globalData.initPromise;

    const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
    const phone = userData.msisdn;

    if (!phone) {
      // Utilisateur non identifié — on garde les données locales si disponibles
      this.setData({ loading: false, error: local.length === 0 });
      if (local.length === 0) {
        wx.showToast({
          title: i18n.errors.auth.login_required,
          icon: 'none',
          duration: 3000,
        });
      }
      return;
    }

    try {
      const reservations = await getUserReservationCards(phone);
      const total = reservations.length;
      this.setData({
        reservations,
        loading: false,
        error: false,
        resultsLabel: total === 0 ? '' : `${total} réservation${total > 1 ? 's' : ''}`,
      });
    } catch (err) {
      this.setData({ loading: false, error: local.length === 0 });
      // Si on a des données locales, on ne dérange pas l'utilisateur
      // Si on n'a rien du tout, on affiche un message clair
      if (local.length === 0) {
        handleAppError(err, { context: 'reservations' });
      }
    }
  },

  retryReservations() {
    this.refreshReservations();
  },

  openReservationDetails(event) {
    const detail = event.detail || {};
    const bookingRef = detail.bookingRef || detail.id || detail.reference;
    if (!bookingRef) return;
    wx.navigateTo({ url: `/pages/reservation-detail/reservation-detail?bookingRef=${encodeURIComponent(bookingRef)}` });
  },
});

