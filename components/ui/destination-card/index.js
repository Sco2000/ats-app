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
  data: {
    isLiked: false
  },
  observers: {
    destination(destination) {
      this.setData({
        isLiked: Boolean(destination && destination.like),
      });
    }
  },
  methods: {
    handleLikeTap() {
      console.log('[DestinationCard] heart tapped', this.properties.destination);

      const nextLiked = !this.data.isLiked;
      this.setData({
        isLiked: nextLiked,
      });

      this.triggerEvent('toggleLike', {
        destination: this.properties.destination,
        like: nextLiked,
      }, {
        bubbles: true,
        composed: true,
      });
    },

    handleSubmit() {
      this.triggerEvent('onCardPress');
    },
  },
});
