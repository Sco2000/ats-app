import { buildReservationDetail, getReservationByReference } from '../../utils/helpers/reservations.js';

function decodeBookingRef(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
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
        reservation: buildReservationDetail(result.reservation),
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
