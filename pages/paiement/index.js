const app = getApp();
import { createReservation } from '../../utils/helpers/reservations.js';

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function parsePrice(price) {
  return Number(String(price || '').replace(/[^\d]/g, '')) || 0;
}

function safeDecode(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

Page({
  data: {
    reservation: { title: '', category: '', duration: '', amount: '' },
    reference: '',
    isPaying: false,
    packageId: '',
    date: '',
    travelers: 0,
    total: 0,
    packageInfo: null,
  },

  onLoad(options = {}) {
    const destinations = Array.isArray(app.globalData.DESTINATIONS) ? app.globalData.DESTINATIONS : [];
    const destinationId = Number(options.packageId || options.destinationId || options.id);
    const destination = destinations.find((item) => Number(item.id) === destinationId) || {};
    const adults = Math.max(1, Number(options.adults) || 2);
    const children = Math.max(0, Number(options.children) || 0);
    const basePrice = parsePrice(destination.price);
    const calculated = (adults * basePrice) + (children * Math.round(basePrice * 0.5));
    const total = parsePrice(safeDecode(options.total)) || calculated;
    const amount = formatPrice(total);

    this.setData({
      reservation: {
        title: destination.title || '',
        category: destination.category || destination.city || '',
        duration: destination.duration || '',
        amount,
      },
      packageId: String(options.packageId || destination.id || ''),
      date: options.dateIso || '',
      travelers: Math.max(0, Number(options.travelers) || adults + children),
      total,
      packageInfo: {
        id: destination.id || destinationId || '',
        title: destination.title || '',
        image: destination.image || destination.heroImage || '',
        location: destination.subtitle || destination.city || destination.category || '',
        currency: destination.currency || 'XOF',
      },
    });
  },

  async handlePay() {
    if (this._payLocked) return;
    const { packageId, date, travelers, total, packageInfo } = this.data;
    if (!packageId || !date || !travelers || !total) {
      wx.showToast({ title: 'Informations de réservation incomplètes', icon: 'none' });
      return;
    }

    this._payLocked = true;
    this.setData({ isPaying: true });
    try {
      const created = await createReservation({
        package_id: Number(packageId), date, travelers, total,
      }, packageInfo);
      wx.redirectTo({
        url: `/pages/booking-confirmation/booking-confirmation?reference=${encodeURIComponent(created.bookingRef)}`,
      });
    } catch (error) {
      const message = error.message || (error.error && error.error.message) || 'Échec de la réservation. Réessayez.';
      wx.showToast({ title: message, icon: 'none', duration: 3000 });
    } finally {
      this._payLocked = false;
      this.setData({ isPaying: false });
    }
  },
});
