const app = getApp();

Page({
  data: {
    activeTab: "voyages",
    reservationId: "",
    showModal: true,
  },

  onLoad(options = {}) {
    const reservationId = options.id || options.reference;
          
    if (!reservationId) {
      wx.showToast({
        title: "Réservation introuvable",
        icon: "none",
      });

      wx.navigateBack();
      return;
    }

    this.setData({ reservationId, showModal: true });
  },
    
  closeModal() {
    this.setData({ showModal: false }, () => {
      wx.navigateBack();
    });
  },

  goBack() {
    this.closeModal();
  },

  noop() {
    // Reserved for future actions
  },
});
