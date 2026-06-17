import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'components', 'HealthCollectionForm.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Rename the destructured tGlobal back to t
code = code.replace('const { i18n, t: tGlobal } = useTranslation();', 'const { i18n, t } = useTranslation();');

// 2. Rename the local dictionary object from t to localDict
code = code.replace('const t = LOCALES[lang] || LOCALES["en"];', 'const localDict = LOCALES[lang] || LOCALES["en"];');
code = code.replace('const t = LOCALES[lang] || LOCALES.en;', 'const localDict = LOCALES[lang] || LOCALES.en;');

// 3. Replace all property accesses like t.age with localDict.age
// We'll use a regex that matches `t.` but not inside quotes. Actually, since it's just t.propertyName in JSX `{t.age}` or code.
code = code.replace(/\bt\.([a-zA-Z_]+)/g, 'localDict.$1');

// Wait, the regex `\bt\.([a-zA-Z_]+)` will also match `t.age` but what if `t` is a function call like `t("key")`? 
// The regex specifically matches `t.` (t followed by a dot). A function call is `t(`, so it won't match.
// This is perfect!

fs.writeFileSync(filePath, code);
console.log("Fixed t collision in HealthCollectionForm.tsx!");
