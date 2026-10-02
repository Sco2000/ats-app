// Booking API response schemas, using the keys documented for each endpoint.
export const ReservationSchema = {
  id: ['@link.id', '@link.booking_ref', '@link.bookingRef', '@link.reference'],
  bookingRef: ['@link.booking_ref', '@link.bookingRef', '@link.reference', '@link.id'],
  status: '@link.status',
  total: '@link.total',
  currency: '@link.currency',
  note: '@link.note',
};

export const ReservationDetailSchema = {
  id: ['@link.id', '@link.booking_ref', '@link.bookingRef', '@link.reference'],
  bookingRef: ['@link.booking_ref', '@link.bookingRef', '@link.reference', '@link.id'],
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
