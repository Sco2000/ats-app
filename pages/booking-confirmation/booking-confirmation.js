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
    reference: 'ATS39ZY3C6',
    amount: '',
  },

  onLoad(options = {}) {
    this.setData({
      reference: safeDecode(options.reference) || 'ATS39ZY3C6',
      amount: safeDecode(options.amount),
    });
  },

  handleDownloadReceipt() {
    wx.showToast({
      title: 'Reçu en préparation',
      icon: 'none',
    });
  },

  handleContactWhatsApp() {
    wx.showToast({
      title: 'WhatsApp bientôt disponible',
      icon: 'none',
    });
  },

  handleGoHome() {
    wx.reLaunch({
      url: '/pages/home/home',
    });
  },
});
