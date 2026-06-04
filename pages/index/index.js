import { MAIN_TABS } from '../../utils/constants/index';

const app = getApp();

Page({
  /**
   * Initial data of the page
   */
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    isLoading: true,
    userName: '',
    showModal: false,
    destinations: app.globalData.DESTINATIONS,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad() {},

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {},

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {},

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {},

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {},

  /**
   * Handle destination card press
   */
  handleCardPress() {
    wx.showToast({
      title: 'Carte cliquée !',
      icon: 'success',
      duration: 2000,
    });
  },

  handleDestinationLike(event) {
    const { destination, like } = event.detail;
    if (!destination) {
      return;
    }

    const updatedDestinations = (this.data.destinations || []).map((item) => (
      item.id === destination.id
        ? { ...item, like }
        : item
    ));

    this.setData({ destinations: updatedDestinations });
    app.globalData.DESTINATIONS = updatedDestinations;
  },
});
