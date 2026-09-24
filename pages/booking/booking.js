const app = getApp();

const DISABLED_BUTTON_STYLE = 'height: 112rpx !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; border-radius: 32rpx !important; background: #95CFA5 !important; background-color: #95CFA5 !important; color: #FFFFFF !important; font-size: 32rpx !important; font-weight: 700 !important; line-height: 40rpx !important; box-shadow: 0 18rpx 32rpx rgba(22, 163, 74, 0.12) !important;';
const ACTIVE_BUTTON_STYLE = 'height: 112rpx !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; border-radius: 32rpx !important; background: #16A34A !important; background-color: #16A34A !important; color: #FFFFFF !important; font-size: 32rpx !important; font-weight: 700 !important; line-height: 40rpx !important; box-shadow: 0 18rpx 32rpx rgba(22, 163, 74, 0.18) !important;';
const TRAVELER_CARD_STYLE = 'width: 100% !important; min-height: 154rpx !important; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 24rpx !important; padding: 0 32rpx !important; border: 2rpx solid #E5E7EB !important; border-radius: 32rpx !important; background: #FFFFFF !important; background-color: #FFFFFF !important; box-sizing: border-box !important; gap: 0 !important;';
const PRICE_CARD_STYLE = 'width: 100% !important; min-height: 296rpx !important; display: flex !important; flex-direction: column !important; padding: 38rpx 42rpx 34rpx !important; border: 0 !important; border-radius: 28rpx !important; background: #F5E9DA !important; background-color: #F5E9DA !important; box-sizing: border-box !important; margin-bottom: 38rpx !important; gap: 0 !important;';

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function parsePrice(price) {
  return Number(String(price || '').replace(/[^\d]/g, '')) || 0;
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function tomorrowIso() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
}
function createFutureDates(count = 12) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index + 1);
    return { day: DAYS[date.getDay()], date: String(date.getDate()), month: MONTHS[date.getMonth()], isoDate: formatDate(date) };
  });
}

Page({
  data: {
    destination: null,
    basePrice: 15000,
    selectedDate: -1,
    selectedDateIso: '',
    minDate: tomorrowIso(),
    canContinue: false,
    continueButtonStyle: DISABLED_BUTTON_STYLE,
    travelerCardStyle: TRAVELER_CARD_STYLE,
    priceCardStyle: PRICE_CARD_STYLE,
    adults: 1,
    children: 0,
    dates: createFutureDates(),
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
    const destination = destinations.find((item) => Number(item.id) === destinationId) || null;
    const basePrice = destination ? parsePrice(destination.price) : 0;

    this.setData({
      destination,
      basePrice,
    }, () => {
      this.updatePrice();
    });
  },

  selectDate(event) {
    const index = Number(event.currentTarget.dataset.index);
    const selected = this.data.dates[index];
    if (!selected || selected.isoDate <= formatDate(new Date())) return;
    this.setData({
      selectedDate: index,
      selectedDateIso: selected.isoDate,
      canContinue: true,
      continueButtonStyle: ACTIVE_BUTTON_STYLE,
    });
  },

  onDatePickerChange(event) {
    const isoDate = event.detail.value;
    const date = new Date(`${isoDate}T00:00:00`);
    if (!isoDate || isoDate < tomorrowIso()) return;
    const dates = this.data.dates;
    const existing = dates.findIndex((item) => item.isoDate === isoDate);
    if (existing >= 0) {
      this.setData({ selectedDate: existing, selectedDateIso: isoDate, canContinue: true, continueButtonStyle: ACTIVE_BUTTON_STYLE, showDatePicker: false });
      return;
    }
    this.setData({
      dates: [...dates, { day: DAYS[date.getDay()], date: String(date.getDate()), month: MONTHS[date.getMonth()], isoDate }],
      selectedDate: dates.length,
      selectedDateIso: isoDate,
      canContinue: true,
      continueButtonStyle: ACTIVE_BUTTON_STYLE,
      showDatePicker: false,
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
      selectedDateIso,
      totalPrice,
    } = this.data;
    const selectedDateItem = this.data.dates[selectedDate] || null;
    const dateLabel = selectedDateItem ? `${selectedDateItem.day} ${selectedDateItem.date} ${selectedDateItem.month}` : '';
    const params = [
      `destinationId=${encodeURIComponent(destination && destination.id || '')}`,
      `adults=${adults}`,
      `children=${children}`,
      `total=${encodeURIComponent(totalPrice)}`,
      `date=${encodeURIComponent(dateLabel)}`,
      `dateIso=${encodeURIComponent(selectedDateIso)}`,
      `packageId=${encodeURIComponent(destination && destination.id || '')}`,
      `travelers=${adults + children}`,
    ].join('&');

    wx.navigateTo({
      url: `/pages/paiement/index?${params}`,
    });
  }
});
