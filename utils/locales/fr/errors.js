export const ERROR_MESSAGES = {
  // ── Réseau ──────────────────────────────────────
  network: {
    default:         'Connexion réseau perdue. Vérifiez votre connexion et réessayez.',
    catalog:         'Impossible de charger le catalogue. Vérifiez votre connexion.',
    booking:         'La réservation n\'a pas pu être envoyée. Vérifiez votre connexion et réessayez.',
    payment:         'La confirmation du paiement a échoué (réseau). Votre réservation reste en attente — contactez le support si le problème persiste.',
    cancel:          'Demande d\'annulation non envoyée. Vérifiez votre connexion. Réessayez ou contactez le support.',
    reservations:    'Impossible de charger vos voyages. Vérifiez votre connexion.',
  },

  // ── Auth / Token ────────────────────────────────
  auth: {
    default:         'Session expirée. Ferme et réouvre l\'application.',
    booking:         'Session expirée avant la réservation. Relance l\'app et réessaie.',
    payment:         'Session expirée pendant le paiement. Contacte le support avec ta référence.',
    cancel:          'Session expirée. Relance l\'app pour annuler.',
    phone_missing_title: 'Connexion requise',
    phone_missing_desc:  'Votre numéro de téléphone Orange est introuvable. Fermez et rouvrez l\'application.',
    login_required:  'Connexion requise pour voir vos voyages',
  },

  // ── Validation (données manquantes ou invalides) 
  validation: {
    default:         'Informations manquantes ou invalides.',
    booking:         'Informations de réservation incomplètes. Sélectionne une date et un nombre de voyageurs.',
    payment:         'Identifiant de transaction invalide. La réservation existe — contacte le support.',
    cancel:          'Référence ou téléphone manquant. Impossible d\'annuler.',
    phone:           'Numéro de téléphone introuvable. Vérifiez votre compte Orange.',
    destination_not_found: 'Destination non trouvée',
    date_too_early:  (date) => `Réservation possible à partir du ${date}`,
    api_missing_ref: 'Référence de réservation manquante',
    api_missing_phone: 'Numéro de téléphone manquant',
    api_missing_date: 'Nouvelle date requise',
    api_missing_params: 'Paramètres manquants',
  },

  // ── Ressource introuvable (404) ─────────────────
  notFound: {
    default:         'Élément introuvable.',
    booking:         'Réservation introuvable avec cette référence.',
    destination:     'Cette destination n\'est plus disponible.',
    detail_empty:    'Réservation introuvable ou détail indisponible.',
  },

  // ── Erreur serveur ATS / service externe (5xx) ──
  server: {
    default:         'Service temporairement indisponible. Nos équipes sont sur le coup !',
    booking:         'Le serveur n\'a pas pu enregistrer la réservation. Veuillez patienter et réessayer.',
    payment:         'Erreur lors de la confirmation du paiement côté serveur. ATS vous contactera pour confirmer.',
    cancel:          'Erreur serveur lors de la demande d\'annulation. Veuillez réessayer plus tard.',
  },

  // ── API Spécifique ──────────────────────────────
  api: {
    cancel_failed: 'Impossible d\'annuler la réservation',
    reschedule_failed: 'Impossible de modifier la réservation',
    featured_failed: 'Impossible de récupérer les packages à la une'
  }
};
