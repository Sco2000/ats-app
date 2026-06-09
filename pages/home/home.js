import { MAIN_TABS } from '../../utils/constants/index';

const app = getApp();
Page({
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    destinations: app.globalData.DESTINATIONS,
    filters: [
      { id: 'all', label: 'Tous' },
      { id: 'dakar', label: 'Dakar' },
      { id: 'saly', label: 'Saly' },
      { id: 'sine-saloum', label: 'Sine Saloum' },
      { id: 'saint-louis', label: 'Saint Louis' },
      { id: 'lompoul', label: 'Lompoul' },
      { id: 'experience-locale', label: 'Experience Locale' },



    ],
    activeFilter:'all',
  },

  handleCardPress(event) {
    const destination = event.detail && event.detail.destination;
    const destinationId = destination && destination.id ? destination.id : '';

    wx.navigateTo({
      url: `/pages/booking/booking${destinationId ? `?destinationId=${destinationId}` : ''}`,
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

    handleFilterChange(event){
      this.setData({
        activeFilter:event.detail.id
      })
    },
    handleShowAll(){
      wx.navigateTo(
        {
          url:
          '/pages/explorer/explorer'
        }
      )
     
    },

  onShow() {
    this.setData({
      destinations: app.globalData.DESTINATIONS,
    });
  }
});
