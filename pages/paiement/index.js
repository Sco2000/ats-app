const app = getApp();
import { createReservation } from '../../utils/helpers/reservations.js';
import { backendAPI } from '../../utils/apis/index.js';
import { Bus } from '../../utils/event/index.js';
import { STATE_KEYS } from '../../utils/constants/index.js';
import { withLock } from '../../utils/helpers/interaction.js';
import { handleAppError } from '../../utils/helpers/error-handler.js';

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
    const { packageId, date, travelers, total, packageInfo } = this.data;
    if (!packageId || !date || !travelers || !total) {
      wx.showToast({ title: 'Informations de réservation incomplètes', icon: 'none' });
      return;
    }

    this.setData({ isPaying: true });
    let bookingRef = '';

    try {
      // ── Étape 1 : Créer la réservation (POST /bookings) ──────────────────
      const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
      const phone = userData.msisdn || '770000000';

      const created = await createReservation({
        package_id: Number(packageId),
        date,
        travelers,
        total,
        phone,
      }, packageInfo);

      bookingRef = created.bookingRef;

      // ── Étape 2 : Confirmer le paiement (POST /bookings/{ref}/payment) ────
      // En production, Orange Max It fournit un vrai transaction_id.
      // Pour l'instant on utilise un ID fictif en test — à remplacer par l'ID
      // réel retourné par le SDK Orange Money lors du paiement.
      const transactionId = userData.transactionId || `OM-${Date.now()}`;

      try {
        await backendAPI.confirmBookingPayment(bookingRef, transactionId);
      } catch (paymentError) {
        // La confirmation échoue (réseau, env. test) : on continue quand même,
        // le statut restera pending_payment côté serveur, ATS le verra.
        console.warn('[Paiement] confirmBookingPayment failed (non bloquant):', paymentError);
      }

      // ── Étape 3 : Rediriger vers la confirmation ──────────────────────────
      wx.redirectTo({
        url: `/pages/booking-confirmation/booking-confirmation?reference=${encodeURIComponent(bookingRef)}`,
      });
    } catch (error) {
      handleAppError(error, 'Échec de la réservation. Réessayez.');
    } finally {
      this.setData({ isPaying: false });
    }
  }, 1000),
});
