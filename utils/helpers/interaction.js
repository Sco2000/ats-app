/**
 * Empêche les clics répétés (anti-rebond / throttling) sur une fonction d'action.
 * @param {Function} fn - La fonction à exécuter
 * @param {number} [delay=500] - Délai de verrouillage en ms
 * @returns {Function}
 */
export function withLock(fn, delay = 500) {
  let isLocked = false;
  return function (...args) {
    if (isLocked) return;
    isLocked = true;
    setTimeout(() => {
      isLocked = false;
    }, delay);
    return fn.apply(this, args);
  };
}
