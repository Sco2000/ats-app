function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function formatFcfa(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

/**
 * @typedef {Object} Destination
 * @property {string|number} id
 * @property {string} title
 * @property {number} priceAmount
 * @property {string} currency
 * @property {string} priceLabel
 */

/** @returns {Destination} */
export function mapApiPackageToDestination(api = {}) {
  const categories = Array.isArray(api.categories) ? api.categories : [];
  const category = categories[0] || api.location || '';
  const priceAmount = Number(api.price) || 0;
  const currency = api.currency || 'XOF';
  const priceLabel = currency === 'XOF'
    ? formatFcfa(priceAmount)
    : `${priceAmount.toLocaleString('fr-FR')} ${currency}`;

  return {
    id: api.id,
    title: api.title || '',
    subtitle: api.location || '',
    image: api.image || '/assets/images/img.jpg',
    priceAmount,
    currency,
    priceLabel,
    // Temporary compatibility for older pages/components.
    price: priceLabel,
    duration: api.duration || 'Demi-journée',
    category,
    city: api.location || category,
    tags: ['all', ...categories.map(slugify)],
    like: false,
    rating: api.rating ?? 0,
    reviewCount: api.review_count || 0,
    description: api.description || '',
    gallery: Array.isArray(api.gallery) ? api.gallery : [],
    heroImage: api.image || '',
    available: api.available !== false,
    recommended: Boolean(api.recommended),
  };
}

export function mapApiCategoryToFilter(api = {}) {
  return {
    id: api.slug || slugify(api.name),
    label: api.name || '',
    count: api.count || 0,
  };
}
