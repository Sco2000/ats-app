const fs = require('fs');

function patchFile(path, replacements) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  let changed = false;

  // Add import if not present
  if (!content.includes("import { i18n }")) {
    const importRegex = /import .*?;/g;
    let lastImportMatch;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportMatch = match;
    }
    
    let insertPos = 0;
    if (lastImportMatch) {
      insertPos = lastImportMatch.index + lastImportMatch[0].length;
    }
    
    // Find depth for relative path
    const depth = path.split('/').length - 2;
    const prefix = depth === 2 ? '../../' : (depth === 1 ? '../' : './');
    const importStr = `\nimport { i18n } from '${prefix}utils/locales/fr/index.js';`;
    
    content = content.slice(0, insertPos) + importStr + content.slice(insertPos);
    changed = true;
  }

  // Apply replacements
  for (const { from, to } of replacements) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path, content, 'utf8');
    console.log(`Patched ${path}`);
  }
}

// 1. apis/index.js
patchFile('utils/apis/index.js', [
  { from: "'Impossible d\\'annuler la réservation'", to: "i18n.errors.api.cancel_failed" },
  { from: "'Impossible de modifier la réservation'", to: "i18n.errors.api.reschedule_failed" },
  { from: "'Impossible de récupérer les packages à la une'", to: "i18n.errors.api.featured_failed" },
  { from: "'Paramètres manquants'", to: "i18n.errors.validation.api_missing_params" },
]);

// 2. paiement/index.js
patchFile('pages/paiement/index.js', [
  { from: "'Informations de réservation incomplètes'", to: "i18n.errors.validation.booking" },
  { from: "title: 'Connexion requise',\n          content: 'Votre numéro de téléphone Orange est introuvable. Fermez et rouvrez l\\'application.',", to: "title: i18n.errors.auth.phone_missing_title,\n          content: i18n.errors.auth.phone_missing_desc," },
  { from: "title: 'Demande envoyée ✓',\n          content: free \n            ? 'Votre demande de modification de date a été enregistrée gratuitement.\\n\\nUn conseiller ATS vous contactera.'\n            : `Des frais de modification s'appliquent (${fee} FCFA).\\n\\nVotre demande est enregistrée, un conseiller ATS vous contactera pour le règlement.`", to: "title: i18n.success.reschedule.title,\n          content: free ? i18n.success.reschedule.free : i18n.success.reschedule.with_fee(fee)" },
]);

// 3. reservation-detail.js
patchFile('pages/reservation-detail/reservation-detail.js', [
  { from: "title: 'Annulation en cours…'", to: "title: i18n.common.loading.cancellation" },
  { from: "title: 'Action impossible',\n              content: 'Votre numéro de téléphone est introuvable. Fermez et rouvrez l\\'application.',", to: "title: i18n.errors.auth.phone_missing_title,\n              content: i18n.errors.auth.phone_missing_desc," },
  { from: "title: 'Annulation demandée'", to: "title: i18n.success.cancel.requested" }
]);

// 4. voyage.js
patchFile('pages/voyage/voyage.js', [
  { from: "title: 'Connexion requise pour voir vos voyages'", to: "title: i18n.errors.auth.login_required" }
]);

// 5. booking.js
patchFile('pages/booking/booking.js', [
  { from: "title: 'Destination non trouvée'", to: "title: i18n.errors.validation.destination_not_found" },
  { from: "title: `Réservation possible à partir du ${this.data.minDate}`", to: "title: i18n.errors.validation.date_too_early(this.data.minDate)" },
]);

console.log("Refactoring complete.");
