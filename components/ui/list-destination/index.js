// js

Component({
  properties: {
    destinations: {
      type: Array,
      value: []
    }
  },

  data: {},

  lifetimes: {
    attached() {
      console.log('ListDestination component loaded with destinations:', this.data.destinations);
    }
  }
});