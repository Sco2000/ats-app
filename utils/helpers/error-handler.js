import {
  NetworkError,
  ValidationError,
  AuthorizationError,
  NotFoundError,
  ExternalServiceError,
} from '../errors/index.js';

/**
 * Affiche un toast d'erreur clair et contextualisé à l'utilisateur.
 * @param {Error} error
 * @param {string} [defaultMessage='Une erreur est survenue']
 */
export function handleAppError(error, defaultMessage = 'Une erreur est survenue') {
  console.error('[AppError]', error);

  let userMessage = defaultMessage;
  if (error instanceof NetworkError) {
    userMessage = 'Connexion réseau instable. Vérifiez votre connexion.';
  } else if (error instanceof AuthorizationError) {
    userMessage = 'Session expirée ou non autorisée. Reconnexion en cours...';
  } else if (error instanceof NotFoundError) {
    userMessage = error.message || 'Élément introuvable.';
  } else if (error instanceof ValidationError) {
    userMessage = error.message || 'Informations incomplètes ou invalides.';
  } else if (error instanceof ExternalServiceError) {
    userMessage = error.message || 'Service partenaire temporairement indisponible.';
  } else if (error?.message) {
    userMessage = error.message;
  }

  wx.showToast({
    title: userMessage,
    icon: 'none',
    duration: 3000,
  });
}
