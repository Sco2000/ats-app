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
    showDetailsButton: {
      type: Boolean,
      value: true
    }
  },

  data: {
    gridItemWidth: '100%'
  },

  observers: {
    columns(value) {
      const columnsCount = Math.max(1, Number(value) || 1);
      const gap = 20;
      const totalGap = Math.max(0, (columnsCount - 1) * gap);
      const width = columnsCount > 1 ? `calc((100% - ${totalGap}rpx) / ${columnsCount})` : '100%';
      this.setData({ gridItemWidth: width });
    }
  },

  lifetimes: {
    attached() {
      const columnsCount = Math.max(1, Number(this.data.columns) || 1);
      const gap = 20;
      const totalGap = Math.max(0, (columnsCount - 1) * gap);
      const width = columnsCount > 1 ? `calc((100% - ${totalGap}rpx) / ${columnsCount})` : '100%';
      this.setData({ gridItemWidth: width });
      console.log('ListDestination component loaded with destinations:', this.data.destinations);
    }
  }
});