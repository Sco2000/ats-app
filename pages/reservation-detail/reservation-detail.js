import { buildReservationDetail, getReservationByReference } from '../../utils/helpers/reservations.js';
import { reservationStorage } from '../../utils/storage/reservations.js';
import { backendAPI } from '../../utils/apis/index.js';
import { Bus } from '../../utils/event/index.js';
import { STATE_KEYS } from '../../utils/constants/index.js';
import { calculateCancellationRefund } from '../../utils/helpers/booking-policy.js';
import { withLock } from '../../utils/helpers/interaction.js';
import { handleAppError } from '../../utils/helpers/error-handler.js';

const app = getApp();

function decodeBookingRef(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

Page({
  data: { bookingRef: '', reservation: null, loading: true, error: false, localFallback: false },

  onLoad(options = {}) {
    const rawRef = options.bookingRef || options.id || options.reference;
    const bookingRef = decodeBookingRef(rawRef);
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

  callSupport: withLock(function () {
    wx.showActionSheet({
      itemList: ['Appeler le service client (+221 33 824 00 00)', 'Copier le numéro de support'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: '+221338240000', fail: () => {} });
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({
            data: '+221338240000',
            success: () => wx.showToast({ title: 'Numéro copié !', icon: 'success' }),
          });
        }
      },
    });
  }, 1000),

  sendEmail: withLock(function () {
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
  }, 1000),

  downloadTicket: withLock(function () {
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
            success: () => wx.showToast({ title: 'Référence copiée !', icon: 'success' }),
          });
        }
      },
    });
  }, 1000),

  // ── Annulation avec barème API ─────────────────────────────────────────────
  cancelReservation: withLock(async function () {
    const { reservation } = this.data;
    if (!reservation) return;

    // Calcul local préliminaire (booking-policy) pour afficher le barème
    // avant l'appel API, puis le résultat réel de l'API prend la priorité.
    const localRefund = calculateCancellationRefund(reservation.date, reservation.total);
    const daysText = localRefund.daysBeforeDeparture > 0
      ? `${localRefund.daysBeforeDeparture} jours avant le départ`
      : 'moins d\'1 jour avant le départ';

    const content = [
      `Référence : ${reservation.bookingRef}`,
      `Départ : ${reservation.dateLabel || '—'}`,
      ``,
      `Barème d'annulation (${daysText}) :`,
      `  • Montant payé : ${localRefund.formattedTotal}`,
      `  • Frais retenus : ${localRefund.retainedPercent}% (${localRefund.formattedRetainedAmount})`,
      `  • Remboursement estimé : ${localRefund.formattedEstimatedRefund}`,
      ``,
      `Le remboursement sera traité manuellement par ATS.`,
    ].join('\n');

    wx.showModal({
      title: 'Confirmer l\'annulation ?',
      content,
      confirmText: 'Annuler la résa.',
      cancelText: 'Retour',
      confirmColor: '#DC2626',
      success: async (modal) => {
        if (!modal.confirm) return;

        wx.showLoading({ title: 'Annulation en cours…', mask: true });

        try {
          if (app.globalData.initPromise) await app.globalData.initPromise;
          const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
          const phone = userData.msisdn;

          if (!phone) {
            wx.hideLoading();
            wx.showModal({
              title: 'Action impossible',
              content: 'Votre numéro de téléphone est introuvable. Fermez et rouvrez l\'application.',
              showCancel: false,
              confirmText: 'Compris',
              confirmColor: '#0AA347',
            });
            return;
          }

          // Appel API DELETE /bookings/{ref}?phone={num}
          const result = await backendAPI.cancelBooking(reservation.bookingRef, phone);
          const apiRefund = result.refund;

          // Mise à jour stockage local
          reservationStorage.update({
            ...reservation,
            status: 'cancellation_requested',
          });

          // Mise à jour UI
          this.setData({
            'reservation.status': 'cancellation_requested',
            'reservation.statusLabel': 'Annulation demandée',
            'reservation.statusClass': 'pending',
            'reservation.isUpcoming': false,
          });

          wx.showToast({
            title: 'Annulation demandée',
            icon: 'success',
            duration: 3000
          });
        } catch (error) {
          wx.hideLoading();

          // Fallback local si l'API est inaccessible
          reservationStorage.update({ ...reservation, status: 'cancellation_requested' });
          this.setData({
            'reservation.status': 'cancellation_requested',
            'reservation.statusLabel': 'Annulation demandée',
            'reservation.statusClass': 'pending',
            'reservation.isUpcoming': false,
          });

          handleAppError(error, {
            context: 'cancel',
            fallback: 'Demande enregistrée localement. Contactez le support si besoin.',
          });
        }
      },
    });
  }, 1000),

  // ── Rebooking ──────────────────────────────────────────────────────────────
  rebook: withLock(function () {
    const { reservation } = this.data;
    const destinationId = reservation?.package?.id || '';
    const ref = reservation?.bookingRef || '';
    wx.navigateTo({
      url: `/pages/booking/booking?destinationId=${destinationId}&rebookingRef=${encodeURIComponent(ref)}&rebookingEligibility=free`,
    });
  }, 500),
});
