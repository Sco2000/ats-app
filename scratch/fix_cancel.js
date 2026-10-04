const fs = require('fs');
let content = fs.readFileSync('pages/reservation-detail/reservation-detail.js', 'utf8');

const regex = /cancelReservation: withLock\(async function \(\) \{([\s\S]*?)wx\.showModal\(\{/;

const match = content.match(regex);
if (match) {
  console.log("Found cancelReservation");
  let body = match[1];
  
  // Replace body with a try-catch wrapped version
  let newBody = `
    const { reservation } = this.data;
    if (!reservation) return;

    let content = '';
    try {
      const localRefund = calculateCancellationRefund(reservation.date, reservation.total);
      const daysText = localRefund.daysBeforeDeparture > 0
        ? \`\${localRefund.daysBeforeDeparture} jours avant le départ\`
        : "moins d'1 jour avant le départ";

      content = [
        \`Référence : \${reservation.bookingRef}\`,
        \`Départ : \${reservation.dateLabel || '—'}\`,
        \`\`,
        \`Barème d'annulation (\${daysText}) :\`,
        \`  • Montant payé : \${localRefund.formattedTotal}\`,
        \`  • Frais retenus : \${localRefund.retainedPercent}% (\${localRefund.formattedRetainedAmount})\`,
        \`  • Remboursement estimé : \${localRefund.formattedEstimatedRefund}\`,
        \`\`,
        \`Le remboursement sera traité manuellement par ATS.\`
      ].join('\\n');
    } catch (e) {
      console.error('Error calculating refund:', e);
      content = 'Êtes-vous sûr de vouloir annuler la réservation ' + reservation.bookingRef + ' ?';
    }

    `;
    
  content = content.replace(match[1], newBody);
  fs.writeFileSync('pages/reservation-detail/reservation-detail.js', content, 'utf8');
  console.log("Patched cancelReservation with try-catch");
} else {
  console.log("Could not find regex match");
}
