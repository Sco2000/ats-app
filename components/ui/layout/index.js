import { MAIN_TABS } from '../../../utils/constants/index';

Component({
  options: {
    multipleSlots: true
  },

  properties: {
    // Navigation bar properties
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: true },
    transparent: { type: Boolean, value: false },
    showLogo: { type: Boolean, value: false },
    logoSrc: { type: String, value: '' },
    showNavBorder: { type: Boolean, value: true },

    // Tab bar properties
    showTabBar: { type: Boolean, value: true },
    activeTab: { type: String, value: '' },
    tabs: { type: Array, value: MAIN_TABS }
  },

  data: {
    navContentOffset: 88
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 20;

      this.setData({
        navContentOffset: statusBarHeight + 65
      });
    }
  }
});
