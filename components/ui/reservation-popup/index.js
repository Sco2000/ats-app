const app = getApp();

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    reservationId: {
      type: String,
      value: ''
    }
  },

  data: {
    reservation: null,
    focusedSupportAction: ''
  },

  observers: {
    visible(visible) {
      if (visible && this.properties.reservationId) {
        this.loadReservation(this.properties.reservationId);
      }
    },
    reservationId(id) {
      if (id && this.data.visible) {
        this.loadReservation(id);
      }
    }
  },

  methods: {
    loadReservation(idOrReference) {
      const reservations = Array.isArray(app.globalData.RESERVATIONS)
        ? app.globalData.RESERVATIONS
        : [];

      const reservation = reservations.find(
        (r) =>
          String(r.id) === String(idOrReference) ||
          String(r.reference) === String(idOrReference)
      );

      this.setData({ reservation: reservation || null });
    },

    toggleSupportAction(e) {
      const id = e.currentTarget.dataset.id;
      const { focusedSupportAction } = this.data;
      this.setData({
        focusedSupportAction: focusedSupportAction === id ? '' : id,
      });
    },

    handleClose() {
      this.triggerEvent('close');
    },

    handleBookAgain() {
      this.triggerEvent('bookAgain', { reservation: this.data.reservation });
    },

    handleDownloadTicket() {
      this.triggerEvent('downloadTicket', { reservation: this.data.reservation });
    },

    handleCancelReservation() {
      this.triggerEvent('cancelReservation', { reservation: this.data.reservation });
    }
  }
});
