import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src', 'i18n', 'locales');
const enPath = path.join(localesDir, 'en.json');

const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const autoNode = enDict.auto || {};

const langs = ['hi', 'ta', 'ml', 'kn'];

langs.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  let currentObj = {};
  if (fs.existsSync(filePath)) {
    currentObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  // Merge the auto node (leaving english text as fallback structure for translators)
  currentObj.auto = { ...currentObj.auto, ...autoNode };
  
  fs.writeFileSync(filePath, JSON.stringify(currentObj, null, 2));
  console.log(`Synced auto keys to ${lang}.json`);
});
