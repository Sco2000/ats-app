Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home',
    },

    tabs: {
      type: Array,
      value: [],
    },
  },

  methods: {
    handleTap(e) {
      const tab = e.currentTarget.dataset.tab;

      this.triggerEvent('change', { tab });
    },
  },
});