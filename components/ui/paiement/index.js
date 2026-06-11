/**
 * Paiement Component
 * Displays a reservation summary, secure payment copy, and pay action.
 */
Component({
  options: {
    multipleSlots: false
  },

  data: {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  },

  properties: {
    reservation: {
      type: Object,
      value: {
        title: 'Lac Rose',
        category: 'Dakar',
        duration: 'Demi-journée',
        amount: '30 000 FCFA'
      }
    }
  },

  methods: {
    onCardNumberInput(e) {
      this.setData({ cardNumber: e.detail.value });
    },

    onExpiryInput(e) {
      this.setData({ expiryDate: e.detail.value });
    },

    onCvvInput(e) {
      this.setData({ cvv: e.detail.value });
    },

    onCardholderInput(e) {
      this.setData({ cardholderName: e.detail.value });
    },

    onPayPress() {
      const { amount } = this.data.reservation;
      wx.showToast({
        title: `Payer ${amount}`,
        icon: 'none'
      });
    }
  }
});
