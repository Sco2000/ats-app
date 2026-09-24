let destinations = [];
let recommendedDestinations = [];
let filters = [];

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

export function setDestinations(nextDestinations) {
  destinations = normalizeList(nextDestinations);
  return destinations;
}

export function getDestinations() {
  return destinations;
}

export function updateDestinationLike(id, like) {
  destinations = destinations.map((destination) => (
    String(destination.id) === String(id)
      ? { ...destination, like: Boolean(like) }
      : destination
  ));

  return destinations;
}

export function setRecommendedDestinations(nextDestinations) {
  recommendedDestinations = normalizeList(nextDestinations);
  return recommendedDestinations;
}

export function getRecommendedDestinations() {
  return recommendedDestinations;
}

export function setFilters(nextFilters) {
  filters = normalizeList(nextFilters);
  return filters;
}

export function getFilters() {
  return filters;
}

export function resetCatalogStore() {
  destinations = [];
  recommendedDestinations = [];
  filters = [];
}
