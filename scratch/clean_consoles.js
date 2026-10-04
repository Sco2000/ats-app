const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (f.startsWith('.') || f === 'node_modules' || f === 'mp-ats-app' || f === 'scratch') return;
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let removed = 0;

walkDir('.', function(filePath) {
  if (filePath.endsWith('.js') && !filePath.includes('types/index.js') && !filePath.includes('utils/storage.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove lines that are just console.log(...)
    // Matches whitespace, console.log(anything); and the newline
    const newContent = content.replace(/^[ \t]*console\.log\([^;]+;\r?\n?/gm, '');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      removed++;
      console.log('Cleaned:', filePath);
    }
  }
});
console.log('Total files cleaned:', removed);
