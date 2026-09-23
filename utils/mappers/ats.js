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

export function mapApiPackageToDestination(api = {}) {
  const categories = Array.isArray(api.categories) ? api.categories : [];
  const category = categories[0] || api.location || '';

  return {
    id: api.id,
    title: api.title || '',
    subtitle: api.location || '',
    image: api.image || '/assets/images/img.jpg',
    price: formatFcfa(api.price),
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    loading: false,
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
