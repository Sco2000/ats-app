const fs = require('fs');
let content = fs.readFileSync('pages/reservation-detail/reservation-detail.js', 'utf8');
content = content.replace("confirmText: 'Annuler la résa.'", "confirmText: 'Oui'");
content = content.replace("cancelText: 'Retour'", "cancelText: 'Non'");
fs.writeFileSync('pages/reservation-detail/reservation-detail.js', content, 'utf8');
console.log("Fixed showModal button text length");
