const fs = require('fs');
const path = 'src/components/HealthCollectionForm.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace all usages of tGlobal with t
code = code.replace(/\btGlobal\b/g, 't');

fs.writeFileSync(path, code);
console.log("Replaced tGlobal with t.");
