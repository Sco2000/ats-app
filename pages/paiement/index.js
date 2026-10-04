const app = getApp();
import { createReservation, rescheduleReservation } from '../../utils/helpers/reservations.js';
import { backendAPI } from '../../utils/apis/index.js';
import { Bus } from '../../utils/event/index.js';
import { STATE_KEYS } from '../../utils/constants/index.js';
import { withLock } from '../../utils/helpers/interaction.js';
import { handleAppError, handleCriticalError } from '../../utils/helpers/error-handler.js';
import { processOrangePaymentNative } from '../../utils/apis/native.js';
import { i18n } from '../utils/locales/fr/index.js';

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
      rebookingRef: options.rebookingRef || '',
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
    const { packageId, date, adults, children, travelers, total, packageInfo, rebookingRef } = this.data;
    if (!packageId || !date || !travelers || !total) {
      wx.showToast({ title: i18n.errors.validation.booking, icon: 'none' });
      return;
    }

    this.setData({ isPaying: true });
    let bookingRef = '';

    try {
      if (app.globalData.initPromise) await app.globalData.initPromise;
      const userData = Bus.getState(STATE_KEYS?.USER_DATA || 'user.data') || {};
      const phone = userData.msisdn;
      
      if (!phone) {
        wx.showModal({
          title: i18n.errors.auth.phone_missing_title,
          content: i18n.errors.auth.phone_missing_desc,
          showCancel: false,
          confirmText: 'Compris',
          confirmColor: '#0AA347',
        });
        return;
      }

      // --- BRANCHE REBOOKING (MODIFICATION DE DATE) ---
      if (rebookingRef) {
        const res = await rescheduleReservation(rebookingRef, date, phone);
        const free = res.reschedule?.free;
        const fee = res.reschedule?.fee_amount || 0;
        
        wx.showModal({
          title: i18n.success.reschedule.title,
          content: free ? i18n.success.reschedule.free : i18n.success.reschedule.with_fee(fee),
          showCancel: false,
          confirmText: 'Fermer',
          confirmColor: '#0AA347',
          success: () => {
            wx.reLaunch({ url: '/pages/voyage/voyage' });
          }
        });
        return;
      }

      // --- BRANCHE CLASSIQUE (NOUVELLE RÉSERVATION) ---
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

      // ── Étape 2 : Lancer le paiement Orange Money ────
      
      // 🔴 MODE TEST : Génère un faux paiement (À COMMENTER EN PRODUCTION)
      const transactionId = `OM-TEST-${Date.now()}`;

      // 🟢 MODE PRODUCTION : Lance le vrai SDK Orange (À DÉCOMMENTER EN PRODUCTION)
      // const transactionId = await processOrangePaymentNative(total, bookingRef);

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
