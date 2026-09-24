function value(source, ...keys) {
  for (const key of keys) {
    if (source && source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function numberOrOriginal(input) {
  if (input === undefined || input === null || input === '') return input;
  const number = Number(input);
  return Number.isNaN(number) ? input : number;
}

export function mapApiReservation(response = {}) {
  const data = response.data && !Array.isArray(response.data) ? response.data : response;
  return { bookingRef: value(data, 'booking_ref', 'bookingRef') };
}

export function mapApiReservationDetail(response = {}) {
  const data = response.data && !Array.isArray(response.data) ? response.data : response;
  return {
    bookingRef: value(data, 'booking_ref', 'bookingRef'),
    status: value(data, 'status'),
    date: value(data, 'date'),
    travelers: numberOrOriginal(value(data, 'travelers')),
    packageTitle: value(data, 'package'),
    total: numberOrOriginal(value(data, 'total')),
    currency: value(data, 'currency'),
    note: value(data, 'note'),
  };
}
