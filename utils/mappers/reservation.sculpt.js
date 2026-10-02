// Booking API response schemas, using the keys documented for each endpoint.
export const ReservationSchema = {
  bookingRef: ['@link.booking_ref', '@link.bookingRef'],
  status: '@link.status',
  total: '@link.total',
  currency: '@link.currency',
  note: '@link.note',
};

export const ReservationDetailSchema = {
  bookingRef: ['@link.booking_ref', '@link.bookingRef'],
  status: '@link.status',
  date: '@link.date',
  travelers: '@link.travelers',
  packageTitle: ['@link.package', '@link.packageTitle', '@link.title'],
  image: '@link.image',
  location: '@link.location',
  categories: '@link.categories',
  total: '@link.total',
  currency: '@link.currency',
  transactionId: ['@link.transaction_id', '@link.transactionId'],
  note: '@link.note',
};
