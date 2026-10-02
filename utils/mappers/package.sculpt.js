// Package API response schema. Keys follow the documented ATS contract.
const slugify = (value) => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, '-')
  .trim();

export const PackageSchema = {
  id: '@link.id',
  currency: '@link.currency',
  title: '@link.title',
  subtitle: '@link.location',
  image: '@link.image',
  price: (api) => `${Number(api?.price || 0).toLocaleString('fr-FR')} FCFA`,
  duration: '@link.duration',
  category: '@link.categories.0',
  city: '@link.location',
  tags: (api) => (Array.isArray(api?.categories) ? api.categories.map(slugify) : []),
  rating: '@link.rating',
  reviewCount: '@link.review_count',
  description: '@link.description',
  gallery: '@link.gallery',
  available: '@link.available',
  recommended: '@link.recommended',
};
