import { MAIN_TABS } from '../../utils/constants/index';

const app = getApp();
Page({
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    destinations: app.globalData.DESTINATIONS
  },

  handleCardPress() {
    // Placeholder for future destination details navigation.
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
  }
});
