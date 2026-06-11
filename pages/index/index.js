Page({
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
  handleCardPress(event) {
    const { destination } = event.detail || {};

    if (!destination || !destination.id) {
      return;
    }

    navigateTo(`/pages/destination-detail/destination-detail?id=${destination.id}`);
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
