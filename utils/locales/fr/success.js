export const SUCCESS_MESSAGES = {
  // ── Annulation ──────────────────────────────────
  cancel: {
    requested: 'Annulation demandée',
  },

  // ── Modification (Rebooking) ────────────────────
  reschedule: {
    title: 'Demande envoyée ✓',
    free: 'Votre demande de modification de date a été enregistrée gratuitement.\n\nUn conseiller ATS vous contactera.',
    with_fee: (fee) => `Des frais de modification s'appliquent (${fee} FCFA).\n\nVotre demande est enregistrée, un conseiller ATS vous contactera pour le règlement.`,
  }
};
