// js

Component({
  properties: {
    destinations: {
      type: Array,
      value: []
    },
    layout: {
      type: String,
      value: 'scroll'
    },
    columns: {
      type: Number,
      value: 2
    },
    cardWidth: {
      type: String,
      value: '480rpx'
    },
    imageHeight: {
      type: String,
      value: '285rpx'
    },
    cardPaddingClass: {
      type: String,
      value: 'p-3'
    },
    cardStyle: {
      type: String,
      value: ''
    },
    cardContainerStyle: {
      type: String,
      value: ''
    },
    imageRadius: {
      type: String,
      value: '44rpx'
    },
    gridItemWidth: {
      type: String,
      value: ''
    },
    showDetailsButton: {
      type: Boolean,
      value: true
    },
    containerClass: {
      type: String,
      value: ''
    }
  },

  data: {
    computedGridItemWidth: '100%'
  },

  observers: {
    'columns, gridItemWidth': function () {
      if (this.properties.gridItemWidth) {
        this.setData({ computedGridItemWidth: this.properties.gridItemWidth });
        return;
      }

      const value = this.properties.columns;
      const columnsCount = Math.max(1, Number(value) || 1);
      const gap = 20;
      const totalGap = Math.max(0, (columnsCount - 1) * gap);
      const width = columnsCount > 1 ? `calc((100% - ${totalGap}rpx) / ${columnsCount})` : '100%';
      this.setData({ computedGridItemWidth: width });
    }
  },

  lifetimes: {
    attached() {
      if (this.data.gridItemWidth) {
        this.setData({ computedGridItemWidth: this.data.gridItemWidth });
        return;
      }

      const columnsCount = Math.max(1, Number(this.data.columns) || 1);
      const gap = 20;
      const totalGap = Math.max(0, (columnsCount - 1) * gap);
      const width = columnsCount > 1 ? `calc((100% - ${totalGap}rpx) / ${columnsCount})` : '100%';
      this.setData({ computedGridItemWidth: width });
      console.log('ListDestination component loaded with destinations:', this.data.destinations);
    }
  },

  methods: {
    handleCardPress(e) {
      this.triggerEvent('onCardPress', e.detail, {
        bubbles: true,
        composed: true,
      });
    },

    handleToggleLike(e) {
      this.triggerEvent('toggleLike', e.detail, {
        bubbles: true,
        composed: true,
      });
    }
  }
});
