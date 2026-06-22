const app = getApp();

const TEXT_FIXES = {
  '\u00c3\u20ac': '\u00c0',
  '\u00c3\u00a9': '\u00e9',
  '\u00c3\u00a8': '\u00e8',
  '\u00c3\u00aa': '\u00ea',
  '\u00c3\u017d': '\u00ce',
  '\u00c3\u00b4': '\u00f4',
};

function fixText(value = '') {
  let text = String(value);

  Object.keys(TEXT_FIXES).forEach((broken) => {
    text = text.split(broken).join(TEXT_FIXES[broken]);
  });

  return text;
}

function normalizeReservation(reservation) {
  return {
    ...reservation,
    title: fixText(reservation.title),
    subtitle: fixText(reservation.subtitle),
    dateLabel: fixText(reservation.dateLabel),
    travelersLabel: fixText(reservation.travelersLabel),
    price: fixText(reservation.price),
    reference: fixText(reservation.reference),
    statusLabel: fixText(reservation.statusLabel),
  };
}

function findReservation(id) {
  const reservations = Array.isArray(app.globalData.RESERVATIONS)
    ? app.globalData.RESERVATIONS
    : [];

  const reservation = reservations.find((item) => String(item.id) === String(id));
  return reservation ? normalizeReservation(reservation) : null;
}

Page({
  data: {
    reservation: null,
    hasReservation: false,
    pageTopOffset: 20,
  },

  onLoad(options = {}) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 20;
    const reservation = findReservation(options.id);

    if (!reservation) {
      wx.showToast({
        title: 'Reservation introuvable',
        icon: 'none',
      });
      return;
    }

    this.setData({
      reservation,
      hasReservation: true,
      pageTopOffset: statusBarHeight + 8,
    });
  },

  handleBack() {
    if (this._backLocked) {
      return;
    }

    this._backLocked = true;
    setTimeout(() => {
      this._backLocked = false;
    }, 500);

    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({
      url: '/pages/voyage/voyage',
    });
  },

  handleCallSupport() {
    wx.showToast({
      title: 'Appel du support en cours...',
      icon: 'none',
    });
  },

  handleSendEmail() {
    wx.showToast({
      title: 'Ouverture du client email...',
      icon: 'none',
    });
  },

  handleDownloadTicket() {
    wx.showToast({
      title: 'Telechargement du billet...',
      icon: 'none',
    });
  },

  handleCancelReservation() {
    if (!this.data.reservation || this._cancelLocked) {
      return;
    }

    this._cancelLocked = true;

    wx.showModal({
      title: 'Annuler la reservation',
      content: 'Voulez-vous vraiment annuler cette reservation ?',
      confirmText: 'Oui',
      cancelText: 'Non',
      success: (modalRes) => {
        if (modalRes.confirm) {
          this.setData({
            'reservation.status': 'cancelled',
            'reservation.statusLabel': 'Annulee',
          });
          wx.showToast({
            title: 'Reservation annulee',
            icon: 'success',
          });
        }
      },
      complete: () => {
        this._cancelLocked = false;
      },
    });
  },
});
