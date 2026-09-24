function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function firstValue(values = [], fallback = '') {
  const value = values.find((item) => item !== undefined && item !== null && item !== '');
  return value === undefined ? fallback : value;
}

function formatFcfa(value) {
  if (typeof value === 'string' && value.includes('FCFA')) {
    return value;
  }

  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (item && typeof item === 'object') {
        return firstValue([
          item.url,
          item.src,
          item.image,
          item.full,
          item.thumbnail,
        ]);
      }

      return '';
    })
    .filter(Boolean);
}

function normalizeCategory(category) {
  if (!category) {
    return '';
  }

  if (typeof category === 'string') {
    return category;
  }

  if (typeof category === 'object') {
    return firstValue([
      category.name,
      category.label,
      category.title,
      category.slug,
    ]);
  }

  return String(category);
}

export function mapApiPackageToDestination(api = {}) {
  const categories = Array.isArray(api.categories)
    ? api.categories.map(normalizeCategory).filter(Boolean)
    : [];
  const category = firstValue([
    normalizeCategory(api.category),
    normalizeCategory(api.category_name),
    categories[0],
    api.location,
  ]);
  const image = firstValue([
    api.image,
    api.hero_image,
    api.featured_image,
    api.thumbnail,
  ]);
  const location = firstValue([
    api.location,
    api.subtitle,
    api.city,
    category,
  ]);

  return {
    id: firstValue([api.id, api.package_id, api.ID]),
    title: firstValue([api.title, api.name, api.package]),
    subtitle: location,
    image,
    price: formatFcfa(firstValue([api.price, api.amount, api.total], 0)),
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    loading: false,
    duration: firstValue([api.duration, api.time], 'Demi-journee'),
    category,
    city: location || category,
    tags: ['all', ...categories.map(slugify), slugify(category)].filter(Boolean),
    like: false,
    rating: firstValue([api.rating, api.average_rating], '0'),
    reviewCount: Number(firstValue([api.review_count, api.reviews_count], 0)) || 0,
    description: firstValue([api.description, api.content, api.excerpt]),
    gallery: normalizeGallery(firstValue([api.gallery, api.images, api.photos], [])),
    heroImage: firstValue([api.hero_image, api.image, api.featured_image, image]),
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
