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

import { i18n } from '../locales/fr/index.js';

const ERROR_MESSAGES = i18n.errors;

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
