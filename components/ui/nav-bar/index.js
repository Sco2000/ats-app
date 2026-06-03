/**
 * Nav Bar Component
 * Custom navigation bar with safe area handling, back button, title, or centered logo.
 * Reads system status bar height to position content below the notch.
 *
 * @example
 * <!-- Usage with title & back button -->
 * <app-nav-bar title="Settings" showBack />
 *
 * <!-- Usage with centered logo instead of title & back button -->
 * <app-nav-bar showLogo="{{true}}" logoSrc="/assets/images/logo.png" />
 *
 * @property {string} title - Navigation bar title text
 * @property {boolean} showBack - Show back arrow (default: true)
 * @property {boolean} transparent - Use transparent background
 * @property {boolean} showLogo - Show centered logo instead of title/back button (default: false)
 * @property {string} logoSrc - Source path of the logo image
 */
Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: true },
    transparent: { type: Boolean, value: false },
    showLogo: { type: Boolean, value: false },
    logoSrc: { type: String, value: '' },
  },

  data: {
    statusBarHeight: 0,
    navHeight: 44,
    displayMode: 'default',
  },

  observers: {
    'showLogo, logoSrc': function(showLogo, logoSrc) {
      const displayMode = (showLogo && logoSrc) ? 'logo' : 'default';
      this.setData({ displayMode });
    }
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync();
            console.log(sysInfo);

      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 20,
      });
    },
  },

  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
        return;
      }

      wx.reLaunch({
        url: '/pages/home/home',
      });
    },
  },
});
