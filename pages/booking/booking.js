const app = getApp();

const DISABLED_BUTTON_STYLE = 'height: 92rpx !important; padding: 0 !important; border-radius: 46rpx !important; background: #7DCAA0 !important; background-color: #7DCAA0 !important; color: #FFFFFF !important; font-size: 31rpx !important; font-weight: 700 !important; line-height: 92rpx !important; box-shadow: 0 14rpx 28rpx rgba(22, 163, 74, 0.12) !important;';
const ACTIVE_BUTTON_STYLE = 'height: 92rpx !important; padding: 0 !important; border-radius: 46rpx !important; background: #16A34A !important; background-color: #16A34A !important; color: #FFFFFF !important; font-size: 31rpx !important; font-weight: 700 !important; line-height: 92rpx !important; box-shadow: 0 14rpx 28rpx rgba(22, 163, 74, 0.18) !important;';

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

Page({
  data: {
    destination: null,
    basePrice: 15000,
    selectedDate: -1,
    canContinue: false,
    continueButtonStyle: DISABLED_BUTTON_STYLE,
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

    this.setData({
      destination,
      basePrice: 15000,
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

    wx.showToast({
      title: 'Paiement à venir',
      icon: 'success',
      duration: 1800,
    });
  },
});
