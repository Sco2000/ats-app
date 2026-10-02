import { withLock } from '../../utils/helpers/interaction.js';

const app = getApp();

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
    const rawId = options.destinationId;
    const destinationId = rawId ? Number(rawId) : null;

    if (!destinationId || Number.isNaN(destinationId)) {
      wx.showToast({
        title: 'Destination invalide',
        icon: 'none',
        duration: 2000,
      });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
      return;
    }

    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];
    const destination = destinations.find((item) => Number(item.id) === destinationId) || null;

    if (!destination) {
      wx.showToast({
        title: 'Destination non trouvée',
        icon: 'none',
        duration: 2000,
      });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
      return;
    }

    const basePrice = parsePrice(destination.price);

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
    });
  },

  onDatePickerChange(event) {
    const isoDate = event.detail.value;
    const date = new Date(`${isoDate}T00:00:00`);
    if (!isoDate || isoDate < tomorrowIso()) return;
    const dates = this.data.dates;
    const existing = dates.findIndex((item) => item.isoDate === isoDate);
    if (existing >= 0) {
      this.setData({ selectedDate: existing, selectedDateIso: isoDate, canContinue: true, showDatePicker: false });
      return;
    }
    this.setData({
      dates: [...dates, { day: DAYS[date.getDay()], date: String(date.getDate()), month: MONTHS[date.getMonth()], isoDate }],
      selectedDate: dates.length,
      selectedDateIso: isoDate,
      canContinue: true,
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

  handleReserve: withLock(function () {
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
  }, 500),
});
