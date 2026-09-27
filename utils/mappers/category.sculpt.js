// Category API response schema. The filter uses the documented slug as its key.
export const CategorySchema = {
  id: '@link.slug',
  label: '@link.name',
  count: '@link.count',
};
