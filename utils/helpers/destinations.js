import { isFavorite } from './favorites.js';

function uniqueImages(images = []) {
  const seen = {};
  return images.filter((image) => {
    if (!image || seen[image]) return false;
    seen[image] = true;
    return true;
  });
}

function buildGallery(destination) {
  const customGallery = Array.isArray(destination.gallery) ? destination.gallery : [];
  return uniqueImages(customGallery.length ? customGallery : [destination.image]);
}

function getGalleryMode(count) {
  if (count <= 1) return 'single';
  if (count === 2) return 'double';
  return 'mosaic';
}

function normalizeRating(value) {
  const rating = Number(value);
  return Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
}

function formatRatingLabel(rating) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function buildStars(rating) {
  const roundedRating = Math.round(rating);
  return [1, 2, 3, 4, 5].map((value) => ({ value, icon: '★', active: value <= roundedRating }));
}

function buildRemainingGalleryItems(images) {
  const hasSingleLastImage = images.length % 2 === 1;
  return images.map((src, index) => ({
    src,
    index: index + 1,
    fullWidth: hasSingleLastImage && index === images.length - 1,
  }));
}

function normalizeDestination(destination) {
  const gallery = buildGallery(destination);
  const reviewCount = Number(destination.reviewCount || 0);
  const rating = normalizeRating(destination.rating);
  const remainingGalleryImages = gallery.slice(1);
  return {
    ...destination,
    heroImage: destination.heroImage || destination.image,
    description: destination.description || '',
    rating,
    ratingLabel: formatRatingLabel(rating),
    stars: buildStars(rating),
    reviewCount,
    reviewLabel: `(${reviewCount} avis)`,
    duration: destination.duration || '',
    category: destination.category || destination.city || '',
    gallery,
    galleryMode: getGalleryMode(gallery.length),
    mainGalleryImage: gallery[0] || '',
    remainingGalleryImages,
    remainingGalleryItems: buildRemainingGalleryItems(remainingGalleryImages),
  };
}

export function prepareDestinationDetail(destination) {
  return normalizeDestination({ ...destination, like: isFavorite(destination.id) });
}
