const app = getApp();

const DISABLED_BUTTON_STYLE = 'height: 112rpx !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; border-radius: 32rpx !important; background: #95CFA5 !important; background-color: #95CFA5 !important; color: #FFFFFF !important; font-size: 32rpx !important; font-weight: 700 !important; line-height: 40rpx !important; box-shadow: 0 18rpx 32rpx rgba(22, 163, 74, 0.12) !important;';
const ACTIVE_BUTTON_STYLE = 'height: 112rpx !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; border-radius: 32rpx !important; background: #16A34A !important; background-color: #16A34A !important; color: #FFFFFF !important; font-size: 32rpx !important; font-weight: 700 !important; line-height: 40rpx !important; box-shadow: 0 18rpx 32rpx rgba(22, 163, 74, 0.18) !important;';
const TRAVELER_CARD_STYLE = 'width: 100% !important; min-height: 154rpx !important; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 24rpx !important; padding: 0 32rpx !important; border: 2rpx solid #E5E7EB !important; border-radius: 32rpx !important; background: #FFFFFF !important; background-color: #FFFFFF !important; box-sizing: border-box !important; gap: 0 !important;';
const PRICE_CARD_STYLE = 'width: 100% !important; min-height: 296rpx !important; display: flex !important; flex-direction: column !important; padding: 38rpx 42rpx 34rpx !important; border: 0 !important; border-radius: 28rpx !important; background: #F5E9DA !important; background-color: #F5E9DA !important; box-sizing: border-box !important; margin-bottom: 38rpx !important; gap: 0 !important;';

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function parsePrice(price) {
  return Number(String(price || '').replace(/[^\d]/g, '')) || 15000;
}

Page({
  data: {
    destination: null,
    basePrice: 15000,
    selectedDate: -1,
    canContinue: false,
    continueButtonStyle: DISABLED_BUTTON_STYLE,
    travelerCardStyle: TRAVELER_CARD_STYLE,
    priceCardStyle: PRICE_CARD_STYLE,
    adults: 2,
    children: 0,
    dates: [
      { day: 'Mar', date: '9', month: 'Jui' },
      { day: 'Mer', date: '10', month: 'Jui' },
      { day: 'Jeu', date: '11', month: 'Jui' },
      { day: 'Ven', date: '12', month: 'Jui' },
      { day: 'Sam', date: '13', month: 'Jui' },
      { day: 'Dim', date: '14', month: 'Jui' },
      { day: 'Lun', date: '15', month: 'Jui' },
      { day: 'Mar', date: '16', month: 'Jui' },
      { day: 'Mer', date: '17', month: 'Jui' },
      { day: 'Jeu', date: '18', month: 'Jui' },
      { day: 'Ven', date: '19', month: 'Jui' },
      { day: 'Sam', date: '20', month: 'Jui' },
    ],
    adultLine: '2 Adultes x 15 000 FCFA',
    adultSubtotal: '30 000 FCFA',
    childrenLine: '',
    childrenSubtotal: '',
    totalPrice: '30 000 FCFA',
  },

  onLoad(options = {}) {
    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];
    const destinationId = Number(options.destinationId);
    const destination = destinations.find((item) => item.id === destinationId) || null;
    const basePrice = destination ? parsePrice(destination.price) : 15000;

    this.setData({
      destination,
      basePrice,
    }, () => {
      this.updatePrice();
    });
  },

  selectDate(event) {
    this.setData({
      selectedDate: Number(event.currentTarget.dataset.index) || 0,
      canContinue: true,
      continueButtonStyle: ACTIVE_BUTTON_STYLE,
    });
  },

  decreaseAdult() {
    if (this.data.adults <= 1) {
      return;
    }

    this.setData({ adults: this.data.adults - 1 }, () => {
      this.updatePrice();
    });
  },

  increaseAdult() {
    this.setData({ adults: this.data.adults + 1 }, () => {
      this.updatePrice();
    });
  },

  decreaseChild() {
    if (this.data.children <= 0) {
      return;
    }

    this.setData({ children: this.data.children - 1 }, () => {
      this.updatePrice();
    });
  },

  increaseChild() {
    this.setData({ children: this.data.children + 1 }, () => {
      this.updatePrice();
    });
  },

  updatePrice() {
    const { adults, children, basePrice } = this.data;
    const childPrice = Math.round(basePrice * 0.5);
    const adultSubtotal = adults * basePrice;
    const childrenSubtotal = children * childPrice;
    const total = adultSubtotal + childrenSubtotal;

    this.setData({
      adultLine: `${adults} Adulte${adults > 1 ? 's' : ''} x ${formatPrice(basePrice)}`,
      adultSubtotal: formatPrice(adultSubtotal),
      childrenLine: children > 0
        ? `${children} Enfant${children > 1 ? 's' : ''} x ${formatPrice(childPrice)}`
        : '',
      childrenSubtotal: children > 0 ? formatPrice(childrenSubtotal) : '',
      totalPrice: formatPrice(total),
    });
  },

  handleReserve() {
    if (!this.data.canContinue) {
      return;
    }

    const {
      adults,
      children,
      destination,
      selectedDate,
      totalPrice,
    } = this.data;
    const selectedDateItem = this.data.dates[selectedDate] || null;
    const dateLabel = selectedDateItem
      ? `${selectedDateItem.day} ${selectedDateItem.date} ${selectedDateItem.month}`
      : '';
    const params = [
      `destinationId=${destination && destination.id ? destination.id : 4}`,
      `adults=${adults}`,
      `children=${children}`,
      `total=${encodeURIComponent(totalPrice)}`,
      `date=${encodeURIComponent(dateLabel)}`,
    ].join('&');

    wx.navigateTo({
      url: `/pages/paiement/index?${params}`,
    });
  }
});
