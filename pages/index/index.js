Page({
  data: {
    activeTab: 'home',

    tabs: [
      { id: 'home', label: 'Accueil', icon: '⌂' },
      { id: 'explorer', label: 'Explorer', icon: '◉' },
      { id: 'favorites', label: 'Favoris', icon: '♡' },
      { id: 'reservations', label: 'Réservations', icon: '□' },
    ],
  },

  handleTabChange(e) {
    const tab = e.detail.tab;

    this.setData({
      activeTab: tab,
    });
  },
});