import {
  NetworkError,
  ValidationError,
  AuthorizationError,
  NotFoundError,
  ExternalServiceError,
  AppError,
} from '../errors/index.js';

// ============================================================================
// USER-FACING ERROR MESSAGES
// Chaque combinaison (type d'erreur × contexte) donne un message précis.
// ============================================================================

const ERROR_MESSAGES = {
  // ── Réseau ────────────────────────────────────────────────────────────────
  network: {
    default:         'Connexion réseau perdue. Vérifiez votre connexion et réessayez.',
    catalog:         'Impossible de charger le catalogue. Vérifiez votre connexion.',
    booking:         'La réservation n\'a pas pu être envoyée. Vérifiez votre connexion et réessayez.',
    payment:         'La confirmation du paiement a échoué (réseau). Votre réservation reste en attente — contactez le support si le problème persiste.',
    cancel:          'Demande d\'annulation non envoyée. Vérifiez votre connexion. Réessayez ou contactez le support.',
    reservations:    'Impossible de charger vos voyages. Vérifiez votre connexion.',
  },

  // ── Auth / Token ──────────────────────────────────────────────────────────
  auth: {
    default:         'Session expirée. Ferme et réouvre l\'application.',
    booking:         'Session expirée avant la réservation. Relance l\'app et réessaie.',
    payment:         'Session expirée pendant le paiement. Contacte le support avec ta référence.',
    cancel:          'Session expirée. Relance l\'app pour annuler.',
  },

  // ── Validation (données manquantes ou invalides) ───────────────────────────
  validation: {
    default:         'Informations manquantes ou invalides.',
    booking:         'Informations de réservation incomplètes. Sélectionne une date et un nombre de voyageurs.',
    payment:         'Identifiant de transaction invalide. La réservation existe — contacte le support.',
    cancel:          'Référence ou téléphone manquant. Impossible d\'annuler.',
    phone:           'Numéro de téléphone introuvable. Vérifiez votre compte Orange.',
  },

  // ── Ressource introuvable (404) ────────────────────────────────────────────
  notFound: {
    default:         'Élément introuvable.',
    booking:         'Réservation introuvable avec cette référence.',
    destination:     'Cette destination n\'est plus disponible.',
  },

  // ── Erreur serveur ATS / service externe (5xx) ────────────────────────────
  server: {
    default:         'Le service ATS est temporairement indisponible. Réessayez dans quelques instants.',
    booking:         'Le serveur ATS n\'a pas pu créer la réservation. Réessayez ou contacte le support.',
    payment:         'Erreur côté serveur lors de la confirmation du paiement. Contacte le support avec ta référence.',
    cancel:          'Le serveur ATS n\'a pas pu traiter ton annulation. Réessayez ou contacte le support.',
  },

  // ── Erreur inconnue ───────────────────────────────────────────────────────
  unknown: {
    default:         'Une erreur inattendue est survenue. Réessayez.',
  },
};

/**
 * Résout le message utilisateur selon le type d'erreur et le contexte.
 * @param {Error} error
 * @param {string} [context] - 'booking' | 'payment' | 'cancel' | 'catalog' | 'reservations' | 'destination' | 'phone'
 * @param {string} [fallback]
 * @returns {string}
 */
function resolveUserMessage(error, context = 'default', fallback) {
  const ctx = context || 'default';

  if (error instanceof NetworkError) {
    return ERROR_MESSAGES.network[ctx] || ERROR_MESSAGES.network.default;
  }
  if (error instanceof AuthorizationError) {
    return ERROR_MESSAGES.auth[ctx] || ERROR_MESSAGES.auth.default;
  }
  if (error instanceof ValidationError) {
    // Les ValidationError ont déjà un message précis — on l'utilise sauf si on a mieux
    return ERROR_MESSAGES.validation[ctx] || error.message || ERROR_MESSAGES.validation.default;
  }
  if (error instanceof NotFoundError) {
    return ERROR_MESSAGES.notFound[ctx] || error.message || ERROR_MESSAGES.notFound.default;
  }
  if (error instanceof ExternalServiceError) {
    return ERROR_MESSAGES.server[ctx] || ERROR_MESSAGES.server.default;
  }
  if (error instanceof AppError) {
    // AppError générique — on garde le message de l'erreur s'il est explicite
    return error.message || fallback || ERROR_MESSAGES.unknown.default;
  }

  // Erreur JS standard ou inconnue
  return fallback || ERROR_MESSAGES.unknown.default;
}

/**
 * Affiche un toast d'erreur clair et contextualisé à l'utilisateur.
 * Utilise wx.showToast pour les erreurs courtes, wx.showModal pour les erreurs
 * importantes (paiement, annulation) qui nécessitent une confirmation.
 *
 * @param {Error} error
 * @param {Object|string} [options] - contexte string OU { context, fallback, useModal, title }
 *   - context: 'booking' | 'payment' | 'cancel' | 'catalog' | 'reservations' | 'destination'
 *   - fallback: message de repli
 *   - useModal: forcer une modale au lieu d'un toast (pour erreurs critiques)
 *   - title: titre de la modale
 */
export function handleAppError(error, options = {}) {
  console.error('[AppError]', error?.constructor?.name, error?.message, error);

  // Compat descendante : handleAppError(error, 'fallback string')
  if (typeof options === 'string') {
    options = { fallback: options };
  }

  const { context = 'default', fallback, useModal = false, title = 'Oups !' } = options;
  const userMessage = resolveUserMessage(error, context, fallback);

  // Erreurs critiques (paiement, annulation) → modale pour ne pas manquer le message
  const isCritical = useModal
    || error instanceof AuthorizationError
    || (error instanceof NetworkError && ['payment', 'cancel'].includes(context));

  if (isCritical) {
    wx.showModal({
      title,
      content: userMessage,
      showCancel: false,
      confirmText: 'Compris',
      confirmColor: '#0AA347',
    });
  } else {
    // Toast — WeChat tronque à ~14 caractères visibles, on coupe proprement
    const shortMsg = userMessage.length > 40 ? `${userMessage.slice(0, 38)}…` : userMessage;
    wx.showToast({
      title: shortMsg,
      icon: 'none',
      duration: 3500,
    });
  }
}

/**
 * Version spécialisée pour les pages critiques (paiement, annulation).
 * Affiche systématiquement une modale avec un message complet.
 *
 * @param {Error} error
 * @param {string} context - 'payment' | 'cancel' | 'booking'
 * @param {string} [extraInfo] - Info supplémentaire (ex: numéro de référence)
 */
export function handleCriticalError(error, context, extraInfo = '') {
  console.error('[CriticalError]', error?.constructor?.name, error?.message, error);
  const baseMessage = resolveUserMessage(error, context);
  const content = extraInfo ? `${baseMessage}\n\n${extraInfo}` : baseMessage;

  wx.showModal({
    title: 'Action non aboutie',
    content,
    showCancel: false,
    confirmText: 'Compris',
    confirmColor: '#0AA347',
  });
}
