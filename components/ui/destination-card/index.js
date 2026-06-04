// js
Component({
  properties: {
    destination: {
      type: Object,
      value: {
        image: '',
        title: 'bakary',
        subtitle: '',
        price: '',
        buttonLabel: '',
        buttonClass: 'btn-details',
        loading: false,
      },
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
  methods: {
    handleSubmit() {
      this.triggerEvent('onCardPress');
    },
  },
});