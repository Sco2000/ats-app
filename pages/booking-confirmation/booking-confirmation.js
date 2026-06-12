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

function createScaleAnimation(scale, opacity, duration, timingFunction) {
  const animation = wx.createAnimation({
    duration,
    timingFunction,
    delay: 0,
    transformOrigin: '50% 50% 0',
  });

  animation
    .opacity(opacity)
    .scale(scale)
    .step();

  return animation.export();
}

Page({
  data: {
    reference: 'ATS39ZY3C6',
    amount: '',
    showIntroSuccess: true,
    introDocked: false,
    introLeaving: false,
    isStaticSuccessVisible: false,
    isContentVisible: false,
    introSuccessAnimation: null,
  },

  onLoad(options = {}) {
    this.setData({
      reference: safeDecode(options.reference) || 'ATS39ZY3C6',
      amount: safeDecode(options.amount),
    });

    this.resetIntroAnimationState();
  },

  onShow() {
    if (this._hasPlayedIntro) {
      return;
    }

    this._hasPlayedIntro = true;
    this.startIntroAnimation();
  },

  onUnload() {
    this.clearIntroTimers();
  },

  resetIntroAnimationState() {
    this.clearIntroTimers();
    this._introTimers = [];

    this.setData({
      showIntroSuccess: true,
      introDocked: false,
      introLeaving: false,
      isStaticSuccessVisible: false,
      isContentVisible: false,
      introSuccessAnimation: createScaleAnimation(0.2, 0.08, 0, 'linear'),
    });
  },

  startIntroAnimation() {
    this.queueIntroStep(() => {
      this.setData({
        introSuccessAnimation: createScaleAnimation(
          1.25,
          1,
          420,
          'ease-out'
        ),
      });
    }, 50);

    this.queueIntroStep(() => {
      this.setData({
        introSuccessAnimation: createScaleAnimation(
          1,
          1,
          280,
          'ease-in-out'
        ),
      });
    }, 500);

    this.queueIntroStep(() => {
      this.setData({
        introDocked: true,
      });
    }, 820);

    this.queueIntroStep(() => {
      this.setData({
        isStaticSuccessVisible: true,
        introLeaving: true,
      });
    }, 1200);

    this.queueIntroStep(() => {
      this.setData({
        showIntroSuccess: false,
        isContentVisible: true,
      });
    }, 1360);
  },

  queueIntroStep(callback, delay) {
    const timer = setTimeout(callback, delay);
    this._introTimers.push(timer);
  },

  clearIntroTimers() {
    if (!this._introTimers || !this._introTimers.length) {
      this._introTimers = [];
      return;
    }

    this._introTimers.forEach((timer) => clearTimeout(timer));
    this._introTimers = [];
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
