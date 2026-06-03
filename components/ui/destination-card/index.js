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
  },
  methods: {
    handleSubmit() {
      this.triggerEvent('onCardPress');
    },
  },
});