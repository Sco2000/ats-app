const DEFAULT_TABS = [
  {
    id: 'home',
    label: 'Accueil',
    icon: '/assets/icones/home.svg',
    url: '/pages/index/index',
    content: 'Bienvenue sur Accueil',
  },
  {
    id: 'explorer',
    label: 'Explorer',
    icon: '/assets/icones/boussole.svg',
    url: '/pages/explorer/index',
    content: 'Page Explorer',
  },
  {
    id: 'favorites',
    label: 'Favoris',
    icon: '/assets/icones/heart.svg',
    url: '/pages/favorites/index',
    content: 'Page Favoris',
  },
  {
    id: 'reservations',
    label: 'R\u00e9servations',
    icon: '/assets/icones/calendrier.svg',
    url: '/pages/reservations/index',
    content: 'Page R\u00e9servations',
  },
];

const findTab = (tabs, id) => tabs.find((tab) => tab.id === id);

Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home',
    },

    tabs: {
      type: Array,
      value: DEFAULT_TABS,
    },
  },

  data: {
    currentTab: DEFAULT_TABS[0],
  },

  lifetimes: {
    attached() {
      this.updateCurrentTab();
    },
  },

  observers: {
    'activeTab, tabs': function () {
      this.updateCurrentTab();
    },
  },

  methods: {
    updateCurrentTab() {
      const { activeTab, tabs } = this.properties;
      const currentTab = findTab(tabs, activeTab);

      if (currentTab && currentTab.id !== this.data.currentTab?.id) {
        this.setData({ currentTab });
      }
    },

    handleTap(e) {
      const tabId = e.currentTarget.dataset.tab;
      const tab = findTab(this.properties.tabs, tabId);

      if (!tab || tab.id === this.properties.activeTab) return;

      this.triggerEvent('change', { tab: tab.id, url: tab.url });

      if (tab.url) {
        wx.redirectTo({ url: tab.url });
      }
    },
  },
});
