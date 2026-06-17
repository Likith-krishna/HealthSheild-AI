import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';

// Handle CommonJS interop for Babel modules
const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

const componentsDir = path.join(process.cwd(), 'src', 'components');
const localesPath = path.join(process.cwd(), 'src', 'i18n', 'locales', 'en.json');

let enDict = {};
if (fs.existsSync(localesPath)) {
  enDict = JSON.parse(fs.readFileSync(localesPath, 'utf8'));
}
if (!enDict.auto) enDict.auto = {};

function generateKey(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 40).replace(/^_|_$/g, '') || "str_" + Math.floor(Math.random()*10000);
}

function refactorFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  
  if (code.includes('auto_refactored_skip')) return false;

  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (e) {
    console.error(`Failed to parse ${filePath}:`, e.message);
    return false;
  }

  let modified = false;

  traverse(ast, {
    JSXText(path) {
      const text = path.node.value.trim();
      if (text.length > 1 && /[a-zA-Z]/.test(text) && !/^{.*}$/.test(text) && !text.includes('t(') && !text.includes('LOCALES')) {
        // Exclude script tags or styles if any
        if (path.parent.name && (path.parent.name.name === 'script' || path.parent.name.name === 'style')) return;
        
        const key = generateKey(text);
        enDict.auto[key] = text;

        // Replace with {t("auto.key", "text")}
        path.replaceWith({
          type: 'JSXExpressionContainer',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 't' },
            arguments: [
              { type: 'StringLiteral', value: `auto.${key}` },
              { type: 'StringLiteral', value: text }
            ]
          }
        });
        modified = true;
      }
    },
    JSXAttribute(pathNode) {
      const attrName = pathNode.node.name.name;
      if (['placeholder', 'title', 'alt'].includes(attrName) && pathNode.node.value && pathNode.node.value.type === 'StringLiteral') {
        const text = pathNode.node.value.value.trim();
        if (text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('t(')) {
          const key = generateKey(text);
          enDict.auto[key] = text;

          pathNode.node.value = {
            type: 'JSXExpressionContainer',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 't' },
              arguments: [
                { type: 'StringLiteral', value: `auto.${key}` },
                { type: 'StringLiteral', value: text }
              ]
            }
          };
          modified = true;
        }
      }
    }
  });

  if (modified) {
    let output = generate(ast, {
      retainLines: true,
      compact: false,
    }, code).code;

    if (!output.includes("import { t }") && !output.includes('useTranslation')) {
        output = `import { t } from "i18next";\n` + output;
    }

    fs.writeFileSync(filePath, output);
    console.log(`Refactored ${filePath}`);
    return true;
  }
  return false;
}

const files = [
  'HealthCollectionForm.tsx',
  'UserProfileForm.tsx',
  'RegistrationPage.tsx',
  'DashboardPage.tsx',
  'LoginPage.tsx'
];

let totalModified = 0;
files.forEach(file => {
  const fullPath = path.join(componentsDir, file);
  if (fs.existsSync(fullPath)) {
    if (refactorFile(fullPath)) {
      totalModified++;
    }
  }
});

fs.writeFileSync(localesPath, JSON.stringify(enDict, null, 2));

console.log(`\nSuccessfully auto-refactored ${totalModified} files!`);
console.log(`Extracted strings saved to en.json`);
