Component({
  properties: {
    reservation: { type: Object, value: {} },
  },
  methods: {
    handleTap() {
      const res = this.properties.reservation || {};
      const ref = res.bookingRef || res.id || res.reference || res.booking_ref || '';
      this.triggerEvent('select', { bookingRef: ref, id: ref });
    },
  },
});
