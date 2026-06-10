const app = getApp();

Page({
  data: {
    activeTab: 'voyages',
    reservation: {},
    focusedSupportAction: '',
  },

  onLoad(options = {}) {
    const reservation = this.getReservation(options.id || options.reference);

    if (!reservation) {
      wx.showToast({
        title: 'Réservation introuvable',
        icon: 'none',
      });

      wx.navigateBack();
      return;
    }

    this.setData({ reservation });
  },

  getReservation(idOrReference) {
    const reservations = Array.isArray(app.globalData.RESERVATIONS)
      ? app.globalData.RESERVATIONS
      : [];

    return reservations.find((reservation) =>
      String(reservation.id) === String(idOrReference)
      || String(reservation.reference) === String(idOrReference)
    );
  },

  toggleSupportAction(e) {
    const id = e.currentTarget.dataset.id;
    const { focusedSupportAction } = this.data;
    this.setData({ focusedSupportAction: focusedSupportAction === id ? '' : id });
  },

  goBack() {
    wx.navigateBack();
  },

  noop() {
    // Reserved for future actions. Buttons are intentionally inactive for now.
  },
});
