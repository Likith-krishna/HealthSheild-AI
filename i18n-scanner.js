import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src', 'components');

const regexBareJSXText = />\s*([a-zA-Z0-9\s.,!?'"()-]+[a-zA-Z]+[a-zA-Z0-9\s.,!?'"()-]*)\s*</g;
const regexPlaceholder = /placeholder=["']([^"']+)["']/g;
const regexTitle = /title=["']([^"']+)["']/g;
const regexAlt = /alt=["']([^"']+)["']/g;

function analyzeFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  let untranslated = [];
  
  // Exclude strings that look like they're inside t()
  // This is a naive regex scanner for demonstration of coverage reporting
  
  let match;
  while ((match = regexBareJSXText.exec(code)) !== null) {
    const text = match[1].trim();
    if (text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('t(') && !text.includes('LOCALES')) {
      // Check if it's not purely a variable or number
      if (!/^{.*}$/.test(text)) {
        untranslated.push(text);
      }
    }
  }

  while ((match = regexPlaceholder.exec(code)) !== null) {
    const text = match[1].trim();
    if (text.length > 1 && !text.includes('t(')) {
      untranslated.push(`[placeholder] ${text}`);
    }
  }
  
  while ((match = regexTitle.exec(code)) !== null) {
    const text = match[1].trim();
    if (text.length > 1 && !text.includes('t(')) {
      untranslated.push(`[title] ${text}`);
    }
  }

  return [...new Set(untranslated)]; // remove duplicates
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalStrings = 0;
  let fileReports = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const res = scanDirectory(fullPath);
      totalStrings += res.totalStrings;
      fileReports = fileReports.concat(res.fileReports);
    } else if (file.endsWith('.tsx')) {
      const untranslated = analyzeFile(fullPath);
      if (untranslated.length > 0) {
        totalStrings += untranslated.length;
        fileReports.push({ file, count: untranslated.length, samples: untranslated.slice(0, 5) });
      }
    }
  }
  return { totalStrings, fileReports };
}

console.log("==========================================");
console.log("🔍 HealthSheild AI - i18n Coverage Scanner");
console.log("==========================================");
const result = scanDirectory(componentsDir);

console.log(`\n🚨 FOUND ${result.totalStrings} UNTRANSLATED HARDCODED STRINGS!\n`);

result.fileReports.sort((a, b) => b.count - a.count).forEach(r => {
  console.log(`❌ ${r.file}: ${r.count} untranslated strings.`);
  console.log(`   Sample: "${r.samples[0]}"`);
});

console.log("\n==========================================");
console.log("Coverage Target: 100%");
console.log("Status: ACTION REQUIRED");
console.log("==========================================");
