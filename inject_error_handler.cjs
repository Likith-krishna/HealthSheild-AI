const fs = require('fs');

const path = 'src/main.tsx';
let mainCode = fs.readFileSync(path, 'utf8');

if (!mainCode.includes('window.addEventListener("error"')) {
  const errorHandler = `
window.addEventListener("error", e => {
  document.body.innerHTML = '<div style="color: red; padding: 20px; z-index: 9999; position: absolute; background: white; width: 100%; height: 100%;"><h1>CRASH</h1><pre>' + (e.error ? e.error.stack : e.message) + '</pre></div>';
});
window.addEventListener("unhandledrejection", e => {
  document.body.innerHTML = '<div style="color: red; padding: 20px; z-index: 9999; position: absolute; background: white; width: 100%; height: 100%;"><h1>PROMISE CRASH</h1><pre>' + (e.reason ? e.reason.stack : e.reason) + '</pre></div>';
});
`;
  
  // Inject before the first import
  mainCode = errorHandler + mainCode;
  fs.writeFileSync(path, mainCode);
  console.log("Injected error handler.");
} else {
  console.log("Error handler already injected.");
}
