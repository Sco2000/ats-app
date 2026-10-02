// ============================================================================
// BOOKING POLICY & BUSINESS RULES
// Règles métier : Délais de réservation, Barème d'annulation & Rebooking
// ============================================================================

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/**
 * Formate une date en chaîne ISO YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Détermine le délai minimum de préparation en jours avant réservation :
 * - Tous les tours : au plus tôt J+2 (2 jours à l'avance)
 * - Exception : "Tour de Dakar en car rapide" nécessite au minimum 5 jours -> J+5
 *
 * @param {Object} [destination]
 * @returns {number} Nombre de jours minimum (2 ou 5)
 */
export function getMinimumLeadDays(destination) {
  if (!destination) return 2;
  const title = String(destination.title || destination.name || '').toLowerCase();
  const slug = String(destination.slug || destination.id || '').toLowerCase();
  const location = String(destination.location || destination.city || destination.subtitle || destination.category || '').toLowerCase();
  const description = String(destination.description || '').toLowerCase();

  const isCarRapide =
    title.includes('car rapide') ||
    slug.includes('car-rapide') ||
    (title.includes('car') && title.includes('rapide')) ||
    (title.includes('dakar') && title.includes('car')) ||
    (title.includes('tour de dakar') && title.includes('rapide')) ||
    location.includes('car rapide') ||
    description.includes('car rapide');

  return isCarRapide ? 5 : 2;
}

/**
 * Renvoie la date minimale sélectionnable au format ISO (YYYY-MM-DD)
 * @param {number} [leadDays=2]
 * @returns {string}
 */
export function getMinBookingDateIso(leadDays = 2) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + leadDays);
  return formatDate(date);
}

/**
 * Génère la liste des dates sélectionnables en respectant le délai minimum
 * @param {number} [leadDays=2]
 * @param {number} [count=14]
 * @returns {Array<{day: string, date: string, month: string, isoDate: string}>}
 */
export function createFutureDates(leadDays = 2, count = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + leadDays + index);
    return {
      day: DAYS[date.getDay()],
      date: String(date.getDate()),
      month: MONTHS[date.getMonth()],
      isoDate: formatDate(date),
    };
  });
}

/**
 * Parse un montant en nombre entier
 * @param {string|number} price
 * @returns {number}
 */
export function parsePrice(price) {
  if (typeof price === 'number') return Math.round(price);
  return Number(String(price || '').replace(/[^\d]/g, '')) || 0;
}

/**
 * Calcule le barème d'annulation selon le délai avant le départ :
 * - >= 30 j : 0 % retenu (100 % remboursé)
 * - < 30 j (10 à 29 j) : 10 % retenu (90 % remboursé)
 * - < 10 j (7 à 9 j) : 30 % retenu (70 % remboursé)
 * - < 7 j (3 à 6 j) : 50 % retenu (50 % remboursé)
 * - < 3 j (0 à 2 j) : 100 % retenu (0 % remboursé)
 *
 * @param {string|Date} tripDate - Date de départ du tour (ex: "2026-10-15")
 * @param {number|string} totalAmount - Montant total de la réservation
 * @returns {Object} Détail du calcul de remboursement
 */
export function calculateCancellationRefund(tripDate, totalAmount) {
  const total = parsePrice(totalAmount);

  let trip;
  if (typeof tripDate === 'string') {
    const clean = tripDate.split('T')[0];
    trip = new Date(`${clean}T00:00:00`);
  } else if (tripDate instanceof Date) {
    trip = new Date(tripDate);
  } else {
    trip = new Date();
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffMs = trip.getTime() - now.getTime();
  const daysBeforeDeparture = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let retainedPercent = 100;
  let ruleLabel = '';

  if (daysBeforeDeparture >= 30) {
    retainedPercent = 0;
    ruleLabel = '≥ 30 jours (0% retenu)';
  } else if (daysBeforeDeparture >= 10) {
    retainedPercent = 10;
    ruleLabel = '< 30 jours (10% retenu)';
  } else if (daysBeforeDeparture >= 7) {
    retainedPercent = 30;
    ruleLabel = '< 10 jours (30% retenu)';
  } else if (daysBeforeDeparture >= 3) {
    retainedPercent = 50;
    ruleLabel = '< 7 jours (50% retenu)';
  } else {
    retainedPercent = 100;
    ruleLabel = '< 3 jours (100% retenu)';
  }

  const refundPercent = 100 - retainedPercent;
  const retainedAmount = Math.round((total * retainedPercent) / 100);
  const estimatedRefund = Math.max(0, total - retainedAmount);

  return {
    daysBeforeDeparture,
    retainedPercent,
    refundPercent,
    retainedAmount,
    estimatedRefund,
    ruleLabel,
    formattedTotal: `${total.toLocaleString('fr-FR')} FCFA`,
    formattedEstimatedRefund: `${estimatedRefund.toLocaleString('fr-FR')} FCFA`,
    formattedRetainedAmount: `${retainedAmount.toLocaleString('fr-FR')} FCFA`,
  };
}

/**
 * Vérifie l'éligibilité au Rebooking (report de date) :
 * - >= 7 jours : Gratuit
 * - Entre 6 et 3 jours : Possible avec frais
 * - < 3 jours : Pas possible
 *
 * @param {string|Date} tripDate - Date de départ actuelle
 * @returns {Object} Éligibilité et barème de report
 */
export function checkRebookingEligibility(tripDate) {
  let trip;
  if (typeof tripDate === 'string') {
    const clean = tripDate.split('T')[0];
    trip = new Date(`${clean}T00:00:00`);
  } else if (tripDate instanceof Date) {
    trip = new Date(tripDate);
  } else {
    trip = new Date();
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffMs = trip.getTime() - now.getTime();
  const daysBeforeDeparture = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysBeforeDeparture >= 7) {
    return {
      allowed: true,
      free: true,
      daysBeforeDeparture,
      badge: 'Report gratuit',
      title: 'Report de date gratuit',
      message: `Votre départ est prévu dans ${daysBeforeDeparture} jours. Le report de date est 100% gratuit jusqu'à 7 jours avant le départ.`,
    };
  } else if (daysBeforeDeparture >= 3) {
    return {
      allowed: true,
      free: false,
      daysBeforeDeparture,
      badge: 'Report avec frais',
      title: 'Report possible avec frais',
      message: `Votre départ est prévu dans ${daysBeforeDeparture} jours (entre 3 et 6 jours). Le report est possible avec des frais de modification selon nos CGV.`,
    };
  } else {
    return {
      allowed: false,
      free: false,
      daysBeforeDeparture,
      badge: 'Report impossible',
      title: 'Report non disponible',
      message: `Votre départ est prévu dans moins de 3 jours (${Math.max(0, daysBeforeDeparture)} j). Conformément à nos conditions générales, le report n'est plus possible à moins de 72h du départ.`,
    };
  }
}
