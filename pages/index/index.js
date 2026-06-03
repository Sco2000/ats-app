import { MAIN_TABS } from '../../utils/constants/index';

const TAB_TITLES = {
  home: "Page d'Accueil",
  explorer: 'Explorer les Destinations',
  favorites: 'Mes Favoris',
  voyages: 'Mes Voyages'
};

Page({
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    pageTitle: TAB_TITLES.home
  },

  handleTabChange(e) {
    const activeTab = e.detail.tab;

    this.setData({
      activeTab,
      pageTitle: TAB_TITLES[activeTab] || TAB_TITLES.home
    });
  }
});