const app = getApp();
import { createReservation } from '../../utils/helpers/reservations.js';
import { backendAPI } from '../../utils/apis/index.js';
import { Bus } from '../../utils/event/index.js';
import { STATE_KEYS } from '../../utils/constants/index.js';
import { withLock } from '../../utils/helpers/interaction.js';
import { handleAppError, handleCriticalError } from '../../utils/helpers/error-handler.js';

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function parsePrice(price) {
  return Number(String(price || '').replace(/[^\d]/g, '')) || 0;
}

function safeDecode(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

Page({
  data: {
    reservation: { title: '', category: '', duration: '', amount: '' },
    reference: '',
    isPaying: false,
    packageId: '',
    date: '',
    adults: 1,
    children: 0,
    travelers: 0,
    total: 0,
    packageInfo: null,
  },

  onLoad(options = {}) {
    const destinations = Array.isArray(app.globalData.DESTINATIONS) ? app.globalData.DESTINATIONS : [];
    const destinationId = Number(options.packageId || options.destinationId || options.id);
    const destination = destinations.find((item) => Number(item.id) === destinationId) || {};
    const adults = Math.max(1, Number(options.adults) || 2);
    const children = Math.max(0, Number(options.children) || 0);
    const basePrice = parsePrice(destination.price);
    const calculated = (adults * basePrice) + (children * Math.round(basePrice * 0.5));
    const total = parsePrice(safeDecode(options.total)) || calculated;
    const amount = formatPrice(total);

    this.setData({
      reservation: {
        title: destination.title || '',
        category: destination.category || destination.city || '',
        duration: destination.duration || '',
        amount,
      },
      packageId: String(options.packageId || destination.id || ''),
      date: options.dateIso || '',
      adults,
      children,
      travelers: Math.max(0, Number(options.travelers) || adults + children),
      total,
      packageInfo: {
        id: destination.id || destinationId || '',
        title: destination.title || '',
        image: destination.image || destination.heroImage || '',
        location: destination.subtitle || destination.city || destination.category || '',
        currency: destination.currency || 'XOF',
      },
    });
  },

  handlePay: withLock(async function () {
    const { packageId, date, adults, children, travelers, total, packageInfo } = this.data;
    if (!packageId || !date || !travelers || !total) {
      wx.showToast({ title: 'Informations de réservation incomplètes', icon: 'none' });
      return;
    }

    this.setData({ isPaying: true });
    let bookingRef = '';

    try {
      // Attendre que l'app soit initialisée pour avoir le vrai msisdn
      if (app.globalData.initPromise) await app.globalData.initPromise;

      // ── Étape 1 : Créer la réservation (POST /bookings) ──────────────────
      const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
      const phone = userData.msisdn;
      if (!phone) {
        wx.showModal({
          title: 'Connexion requise',
          content: 'Votre numéro de téléphone Orange est introuvable. Fermez et rouvrez l\'application.',
          showCancel: false,
          confirmText: 'Compris',
          confirmColor: '#0AA347',
        });
        return;
      }

      const created = await createReservation({
        package_id: Number(packageId),
        date,
        travelers,
        travelersAdulte: adults,      // ← propagation du split adultes/enfants
        travelersEnfant: children,
        total,
        phone,
      }, packageInfo);

      bookingRef = created.bookingRef;

      // ── Étape 2 : Confirmer le paiement (POST /bookings/{ref}/payment) ────
      // En production, Orange Max It fournit un vrai transaction_id via le SDK.
      // Pour l'instant on génère un ID horodaté — à remplacer par le vrai.
      const transactionId = userData.transactionId || `OM-${Date.now()}`;

      try {
        await backendAPI.confirmBookingPayment(bookingRef, transactionId);
      } catch (paymentError) {
        // Non bloquant — on redirige quand même, mais on prévient l'utilisateur
        console.warn('[Paiement] confirmBookingPayment failed:', paymentError);
        handleCriticalError(
          paymentError,
          'payment',
          `Référence : ${bookingRef}\nVotre réservation a été créée mais le paiement n'a pas été confirmé. Conservez votre référence et contactez le support si nécessaire.`,
        );
      }

      // ── Étape 3 : Rediriger vers la confirmation ──────────────────────────
      wx.redirectTo({
        url: `/pages/booking-confirmation/booking-confirmation?reference=${encodeURIComponent(bookingRef)}`,
      });
    } catch (error) {
      handleAppError(error, { context: 'booking' });
    } finally {
      this.setData({ isPaying: false });
    }
  }, 1000),
});
