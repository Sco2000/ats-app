const app = getApp();

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function parsePrice(price) {
  return Number(String(price || '').replace(/[^\d]/g, '')) || 0;
}

function safeDecode(value) {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

Page({
  data: {
    reservation: {
      title: 'Lac Rose',
      category: 'Dakar',
      duration: 'Demi-journée',
      amount: '30 000 FCFA',
    },
    reference: 'ATS39ZY3C6',
    isPaying: false,
  },

  onLoad(options = {}) {
    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];
    const destinationId = Number(options.destinationId || options.id);
    const destination = destinations.find((item) => item.id === destinationId)
      || destinations.find((item) => item.id === 4)
      || destinations[0]
      || {};
    const adults = Math.max(1, Number(options.adults) || 2);
    const children = Math.max(0, Number(options.children) || 0);
    const basePrice = parsePrice(destination.price) || 15000;
    const childPrice = Math.round(basePrice * 0.5);
    const computedAmount = formatPrice((adults * basePrice) + (children * childPrice));
    const amount = safeDecode(options.total) || computedAmount;

    this.setData({
      reservation: {
        title: destination.title || 'Lac Rose',
        category: destination.category || destination.city || 'Dakar',
        duration: destination.duration || 'Demi-journée',
        amount,
      },
    });
  },

  handlePay() {
    if (this._payLocked) {
      return;
    }

    this._payLocked = true;
    this.setData({ isPaying: true });

    const { reference, reservation } = this.data;
    const params = [
      `reference=${encodeURIComponent(reference)}`,
      `amount=${encodeURIComponent(reservation.amount)}`,
    ].join('&');

    setTimeout(() => {
      this._payLocked = false;
      this.setData({ isPaying: false });

      wx.redirectTo({
        url: `/pages/booking-confirmation/booking-confirmation?${params}`,
      });
    }, 2000);
  },
});
