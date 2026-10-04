const fs = require('fs');

let c = fs.readFileSync('utils/helpers/error-handler.js', 'utf8');
const start = c.indexOf('const ERROR_MESSAGES = {');
const end = c.indexOf('};\n\n/**', start);

if (start > -1 && end > -1) {
  c = c.slice(0, start) + 
      "import { i18n } from '../locales/fr/index.js';\n\nconst ERROR_MESSAGES = i18n.errors;\n\n" + 
      c.slice(end + 4);
  fs.writeFileSync('utils/helpers/error-handler.js', c);
  console.log("Refactored error-handler.js");
}
