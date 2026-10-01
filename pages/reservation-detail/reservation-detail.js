import { buildReservationDetail, getReservationByReference } from '../../utils/helpers/reservations.js';

function decodeBookingRef(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

Page({
  data: { bookingRef: '', reservation: null, loading: true, error: false, localFallback: false },

  onLoad(options = {}) {
    const bookingRef = decodeBookingRef(options.bookingRef);
    this.setData({ bookingRef });
    this.loadReservation();
  },

  async loadReservation() {
    const { bookingRef } = this.data;
    if (!bookingRef) {
      this.setData({ loading: false, error: true });
      return;
    }
    this.setData({ loading: true, error: false });
    try {
      const result = await getReservationByReference(bookingRef);
      this.setData({
        reservation: buildReservationDetail(result.reservation),
        localFallback: !result.fromApi,
        error: !result.fromApi,
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: true, localFallback: false });
    }
  },

  retry() { this.loadReservation(); },

  callSupport() {
    wx.showActionSheet({
      itemList: ['Appeler le service client (+221 33 824 00 00)', 'Copier le numéro de support'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({
            phoneNumber: '+221338240000',
            fail: () => {},
          });
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({
            data: '+221338240000',
            success: () => wx.showToast({ title: 'Numéro copié !', icon: 'success' }),
          });
        }
      },
    });
  },

  sendEmail() {
    const email = 'support@africatourismsolutions.com';
    const ref = this.data.reservation?.bookingRef || '';
    wx.setClipboardData({
      data: email,
      success: () => {
        wx.showModal({
          title: 'Email du support',
          content: `L'adresse support (${email}) a été copiée dans votre presse-papier.\n\nPrécisez votre référence [${ref}] dans l'objet de votre message.`,
          showCancel: false,
          confirmText: 'Compris',
          confirmColor: '#0AA347',
        });
      },
    });
  },

  downloadTicket() {
    const { reservation } = this.data;
    if (!reservation) return;

    wx.showModal({
      title: 'Billet de Réservation',
      content: `Référence : ${reservation.bookingRef}\nDestination : ${reservation.package.title || 'Séjour'}\nDate : ${reservation.dateLabel || '—'}\nVoyageurs : ${reservation.travelersLabel || '1'}\nMontant : ${reservation.totalLabel || '—'}\n\nLe document PDF officiel vous sera envoyé par email/SMS par le partenaire ATS.`,
      confirmText: 'Copier Réf.',
      cancelText: 'Fermer',
      confirmColor: '#0AA347',
      success: (res) => {
        if (res.confirm && reservation.bookingRef) {
          wx.setClipboardData({
            data: reservation.bookingRef,
            success: () => {
              wx.showToast({ title: 'Référence copiée !', icon: 'success' });
            },
          });
        }
      },
    });
  },

  cancelReservation() {
    const { reservation } = this.data;
    if (!reservation) return;

    wx.showModal({
      title: 'Demande d\'annulation',
      content: 'Souhaitez-vous demander l\'annulation de cette réservation auprès du partenaire ATS ?',
      confirmText: 'Confirmer',
      cancelText: 'Retour',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: 'Demande d\'annulation prise en compte. Un conseiller vous contactera.',
            icon: 'none',
            duration: 3000,
          });

          this.setData({
            'reservation.statusLabel': 'Annulation demandée',
            'reservation.statusClass': 'pending',
            'reservation.isUpcoming': false,
          });
        }
      },
    });
  },
  rebook() { wx.navigateTo({ url: '/pages/booking/booking' }); },
});
